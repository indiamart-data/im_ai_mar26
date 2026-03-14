import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { EharsUserRole } from '@prisma/client';

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

@Injectable()
export class CommentsService {
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

  async addComment(
    requestId: string,
    dto: CreateCommentDto,
    currentUser: CurrentUser,
  ) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { requester: { select: { email: true } } },
    });
    if (!request) throw new NotFoundException('Request not found');

    const role = currentUser.role as EharsUserRole;
    const isOwner = request.requester.email === currentUser.email;
    const isPrivileged =
      AGENT_ROLES.includes(role) || role === EharsUserRole.MANAGER;

    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException('You cannot comment on this request');
    }

    // Only agents/admins can mark a comment as resolution
    if (dto.isResolution && !AGENT_ROLES.includes(role)) {
      throw new ForbiddenException(
        'Only agents or admins can add resolution comments',
      );
    }

    const dbUser = await this.ensureUser(currentUser);

    return this.prisma.requestComment.create({
      data: {
        requestId,
        authorId: dbUser.id,
        content: dto.content,
        isResolution: dto.isResolution ?? false,
      },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async getComments(requestId: string, currentUser: CurrentUser) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: { id: true, requester: { select: { email: true } } },
    });
    if (!request) throw new NotFoundException('Request not found');

    const role = currentUser.role as EharsUserRole;
    if (
      role === EharsUserRole.EMPLOYEE &&
      request.requester.email !== currentUser.email
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.requestComment.findMany({
      where: { requestId },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
