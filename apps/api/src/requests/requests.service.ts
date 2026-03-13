import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FilterRequestsDto } from './dto/filter-requests.dto';
import { EharsUserRole, RequestStatus, Prisma } from '@prisma/client';
import { paginate, PaginatedResult } from '../common/dto/pagination.dto';

type CurrentUser = { sub: string; email: string; role: string; name: string };

const AGENT_ROLES: EharsUserRole[] = [
  EharsUserRole.IT_AGENT,
  EharsUserRole.FACILITIES_AGENT,
  EharsUserRole.HR_HEAD,
  EharsUserRole.IT_HEAD,
  EharsUserRole.ADMIN_HEAD,
  EharsUserRole.FINANCE_MANAGER,
  EharsUserRole.SYSTEM_ADMIN,
];

const MANAGER_ROLES: EharsUserRole[] = [EharsUserRole.MANAGER, ...AGENT_ROLES];

// Valid status transitions for each role
const ALLOWED_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.PENDING]: [
    RequestStatus.APPROVED,
    RequestStatus.REJECTED,
    RequestStatus.CANCELLED,
  ],
  [RequestStatus.APPROVED]: [
    RequestStatus.IN_PROGRESS,
    RequestStatus.CANCELLED,
  ],
  [RequestStatus.REJECTED]: [],
  [RequestStatus.IN_PROGRESS]: [
    RequestStatus.RESOLVED,
    RequestStatus.CANCELLED,
  ],
  [RequestStatus.RESOLVED]: [RequestStatus.CLOSED, RequestStatus.IN_PROGRESS],
  [RequestStatus.CLOSED]: [],
  [RequestStatus.CANCELLED]: [],
};

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Ensure the EharsUser row exists (auto-provision on first use) ──────────
  private async ensureUser(user: CurrentUser) {
    return this.prisma.eharsUser.upsert({
      where: { email: user.email },
      create: {
        id: user.sub,
        email: user.email,
        name: user.name,
        role: user.role as EharsUserRole,
      },
      update: { name: user.name, role: user.role as EharsUserRole },
    });
  }

  // ── Create ─────────────────────────────────────────────────────────────────
  async create(dto: CreateRequestDto, currentUser: CurrentUser) {
    const dbUser = await this.ensureUser(currentUser);

    // Generate a unique request number inside a serializable transaction to
    // avoid race conditions when two requests are created concurrently.
    const request = await this.prisma.$transaction(
      async (tx) => {
        const count = await tx.serviceRequest.count();
        const requestNumber = `SR-${String(count + 1).padStart(5, '0')}`;

        return tx.serviceRequest.create({
          data: {
            requestNumber,
            title: dto.title,
            description: dto.description,
            type: dto.type,
            priority: dto.priority,
            metadata: dto.metadata as Prisma.InputJsonValue | undefined,
            requesterId: dbUser.id,
          },
          include: { requester: true },
        });
      },
      { isolationLevel: 'Serializable' },
    );

    await this.prisma.requestStatusHistory.create({
      data: {
        requestId: request.id,
        changedById: dbUser.id,
        toStatus: RequestStatus.PENDING,
        notes: 'Request created',
      },
    });

    return request;
  }

  // ── List (with RBAC filtering) ─────────────────────────────────────────────
  async findAll(
    filter: FilterRequestsDto,
    currentUser: CurrentUser,
  ): Promise<PaginatedResult<unknown>> {
    const {
      page,
      limit,
      status,
      type,
      priority,
      requesterId,
      assigneeId,
      search,
    } = filter;
    const skip = (page - 1) * limit;
    const role = currentUser.role as EharsUserRole;

    const where: Prisma.ServiceRequestWhereInput = {};

    // Scope by role
    if (role === EharsUserRole.EMPLOYEE) {
      // Employees can only see their own requests
      where.requester = { email: currentUser.email };
    } else if (role === EharsUserRole.MANAGER) {
      // Managers see requests from their direct reports and themselves
      where.requester = {
        OR: [
          { email: currentUser.email },
          { manager: { email: currentUser.email } },
        ],
      };
    }
    // Admins and agents see all requests (no additional filter)

    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    // requesterId filter only for privileged roles
    if (requesterId && MANAGER_ROLES.includes(role)) {
      where.requesterId = requesterId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          requester: {
            select: { id: true, name: true, email: true, role: true },
          },
          assignee: {
            select: { id: true, name: true, email: true, role: true },
          },
          _count: { select: { approvals: true, comments: true } },
        },
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  // ── Find one ───────────────────────────────────────────────────────────────
  async findOne(id: string, currentUser: CurrentUser) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        requester: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignee: { select: { id: true, name: true, email: true, role: true } },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        statusHistory: {
          include: {
            changedBy: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!request) throw new NotFoundException('Request not found');

    const role = currentUser.role as EharsUserRole;
    if (
      role === EharsUserRole.EMPLOYEE &&
      request.requester.email !== currentUser.email
    ) {
      throw new ForbiddenException('Access denied');
    }

    return request;
  }

  // ── Update status / assign (admin & agent) ─────────────────────────────────
  async updateRequest(
    id: string,
    dto: UpdateRequestDto,
    currentUser: CurrentUser,
  ) {
    const existing = await this.prisma.serviceRequest.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Request not found');

    const role = currentUser.role as EharsUserRole;
    const dbUser = await this.ensureUser(currentUser);

    // Status transition validation
    if (dto.status && dto.status !== existing.status) {
      const allowed = ALLOWED_STATUS_TRANSITIONS[existing.status];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition from ${existing.status} to ${dto.status}`,
        );
      }

      // Only agents/admins can set IN_PROGRESS, RESOLVED, CLOSED
      const agentOnlyStatuses: RequestStatus[] = [
        RequestStatus.IN_PROGRESS,
        RequestStatus.RESOLVED,
        RequestStatus.CLOSED,
      ];
      if (
        agentOnlyStatuses.includes(dto.status) &&
        !AGENT_ROLES.includes(role)
      ) {
        throw new ForbiddenException(
          'Only agents or admins can set this status',
        );
      }
    }

    const updateData: Prisma.ServiceRequestUpdateInput = {};
    if (dto.status) updateData.status = dto.status;
    if (dto.priority) updateData.priority = dto.priority;
    if (dto.assigneeId !== undefined) {
      updateData.assignee = dto.assigneeId
        ? { connect: { id: dto.assigneeId } }
        : { disconnect: true };
    }
    if (dto.status === RequestStatus.RESOLVED)
      updateData.resolvedAt = new Date();
    if (dto.status === RequestStatus.CLOSED) updateData.closedAt = new Date();

    const [updated] = await this.prisma.$transaction([
      this.prisma.serviceRequest.update({ where: { id }, data: updateData }),
      ...(dto.status && dto.status !== existing.status
        ? [
            this.prisma.requestStatusHistory.create({
              data: {
                requestId: id,
                changedById: dbUser.id,
                fromStatus: existing.status,
                toStatus: dto.status,
                notes: dto.notes,
              },
            }),
          ]
        : []),
    ]);

    return updated;
  }

  // ── Cancel (employee cancels own pending request) ──────────────────────────
  async cancel(id: string, currentUser: CurrentUser) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Request not found');

    const dbUser = await this.ensureUser(currentUser);
    const role = currentUser.role as EharsUserRole;

    const isOwner = request.requesterId === dbUser.id;
    const isPrivileged = AGENT_ROLES.includes(role);

    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    const allowed = ALLOWED_STATUS_TRANSITIONS[request.status];
    if (!allowed.includes(RequestStatus.CANCELLED)) {
      throw new BadRequestException(
        `Request in ${request.status} status cannot be cancelled`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.serviceRequest.update({
        where: { id },
        data: { status: RequestStatus.CANCELLED },
      }),
      this.prisma.requestStatusHistory.create({
        data: {
          requestId: id,
          changedById: dbUser.id,
          fromStatus: request.status,
          toStatus: RequestStatus.CANCELLED,
          notes: 'Cancelled by user',
        },
      }),
    ]);

    return { message: 'Request cancelled successfully' };
  }
}
