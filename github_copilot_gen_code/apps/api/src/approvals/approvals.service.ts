import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { ApprovalDecision, EharsUserRole, RequestStatus } from '@prisma/client';

type CurrentUser = { sub: string; email: string; role: string; name: string };

const APPROVER_ROLES: EharsUserRole[] = [
  EharsUserRole.MANAGER,
  EharsUserRole.HR_HEAD,
  EharsUserRole.IT_HEAD,
  EharsUserRole.ADMIN_HEAD,
  EharsUserRole.FINANCE_MANAGER,
  EharsUserRole.SYSTEM_ADMIN,
];

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async approve(
    requestId: string,
    dto: ApproveRequestDto,
    currentUser: CurrentUser,
  ) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found');

    const role = currentUser.role as EharsUserRole;
    if (!APPROVER_ROLES.includes(role)) {
      throw new ForbiddenException(
        'Only managers or heads can approve/reject requests',
      );
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve/reject a request in ${request.status} status`,
      );
    }

    const dbUser = await this.ensureUser(currentUser);
    const newStatus =
      dto.decision === ApprovalDecision.APPROVED
        ? RequestStatus.APPROVED
        : RequestStatus.REJECTED;

    const [approval] = await this.prisma.$transaction([
      this.prisma.requestApproval.create({
        data: {
          requestId,
          approverId: dbUser.id,
          decision: dto.decision,
          comments: dto.comments,
        },
        include: {
          approver: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      this.prisma.serviceRequest.update({
        where: { id: requestId },
        data: { status: newStatus },
      }),
      this.prisma.requestStatusHistory.create({
        data: {
          requestId,
          changedById: dbUser.id,
          fromStatus: RequestStatus.PENDING,
          toStatus: newStatus,
          notes:
            dto.comments ??
            `Request ${dto.decision.toLowerCase()} by ${dbUser.name}`,
        },
      }),
    ]);

    return approval;
  }

  async getApprovals(requestId: string, currentUser: CurrentUser) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        requesterId: true,
        requester: { select: { email: true } },
      },
    });
    if (!request) throw new NotFoundException('Request not found');

    const role = currentUser.role as EharsUserRole;
    // Employees can only see approvals for their own requests
    if (
      role === EharsUserRole.EMPLOYEE &&
      request.requester.email !== currentUser.email
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.requestApproval.findMany({
      where: { requestId },
      include: {
        approver: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
