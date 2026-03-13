import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EharsUserRole } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';

const mockPrisma = {
  serviceRequest: {
    findUnique: jest.fn(),
  },
  eharsUser: {
    upsert: jest.fn(),
  },
  requestComment: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockEmployee = {
  sub: 'user-1',
  email: 'employee@example.com',
  role: EharsUserRole.EMPLOYEE,
  name: 'Test Employee',
};

const mockAgent = {
  sub: 'agent-1',
  email: 'agent@example.com',
  role: EharsUserRole.IT_AGENT,
  name: 'Test Agent',
};

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  // ── addComment ─────────────────────────────────────────────────────────────
  describe('addComment', () => {
    it('should allow request owner (employee) to add a comment', async () => {
      const request = {
        id: 'req-1',
        requester: { email: mockEmployee.email },
      };
      const dbUser = {
        id: 'user-1',
        email: mockEmployee.email,
        name: mockEmployee.name,
        role: EharsUserRole.EMPLOYEE,
      };
      const comment = {
        id: 'comment-1',
        content: 'Please update',
        isResolution: false,
        author: dbUser,
        createdAt: new Date(),
      };

      mockPrisma.serviceRequest.findUnique.mockResolvedValue(request);
      mockPrisma.eharsUser.upsert.mockResolvedValue(dbUser);
      mockPrisma.requestComment.create.mockResolvedValue(comment);

      const dto: CreateCommentDto = { content: 'Please update' };
      const result = await service.addComment('req-1', dto, mockEmployee);
      expect(result.content).toBe('Please update');
    });

    it('should allow agent to add a resolution comment', async () => {
      const request = {
        id: 'req-1',
        requester: { email: 'other@example.com' },
      };
      const dbUser = {
        id: 'agent-1',
        email: mockAgent.email,
        name: mockAgent.name,
        role: EharsUserRole.IT_AGENT,
      };
      const comment = {
        id: 'comment-2',
        content: 'Issue resolved',
        isResolution: true,
        author: dbUser,
        createdAt: new Date(),
      };

      mockPrisma.serviceRequest.findUnique.mockResolvedValue(request);
      mockPrisma.eharsUser.upsert.mockResolvedValue(dbUser);
      mockPrisma.requestComment.create.mockResolvedValue(comment);

      const dto: CreateCommentDto = {
        content: 'Issue resolved',
        isResolution: true,
      };
      const result = await service.addComment('req-1', dto, mockAgent);
      expect(result.isResolution).toBe(true);
    });

    it('should throw ForbiddenException when employee marks comment as resolution', async () => {
      const request = {
        id: 'req-1',
        requester: { email: mockEmployee.email },
      };
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(request);
      mockPrisma.eharsUser.upsert.mockResolvedValue({
        id: 'user-1',
        email: mockEmployee.email,
        name: mockEmployee.name,
        role: EharsUserRole.EMPLOYEE,
      });

      const dto: CreateCommentDto = {
        content: 'Consider resolved',
        isResolution: true,
      };
      await expect(
        service.addComment('req-1', dto, mockEmployee),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when unrelated employee comments on others request', async () => {
      const request = {
        id: 'req-2',
        requester: { email: 'other@example.com' },
      };
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(request);

      const dto: CreateCommentDto = { content: 'Random comment' };
      await expect(
        service.addComment('req-2', dto, mockEmployee),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when request does not exist', async () => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(null);

      const dto: CreateCommentDto = { content: 'Test' };
      await expect(
        service.addComment('non-existent', dto, mockEmployee),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── getComments ────────────────────────────────────────────────────────────
  describe('getComments', () => {
    it('should return comments for request owner', async () => {
      const request = {
        id: 'req-1',
        requester: { email: mockEmployee.email },
      };
      const comments = [
        {
          id: 'comment-1',
          content: 'Hello',
          author: {
            id: 'user-1',
            name: 'Employee',
            email: mockEmployee.email,
            role: EharsUserRole.EMPLOYEE,
          },
        },
      ];

      mockPrisma.serviceRequest.findUnique.mockResolvedValue(request);
      mockPrisma.requestComment.findMany.mockResolvedValue(comments);

      const result = await service.getComments('req-1', mockEmployee);
      expect(result).toHaveLength(1);
    });

    it('should throw ForbiddenException when employee views comments on others request', async () => {
      const request = {
        id: 'req-2',
        requester: { email: 'other@example.com' },
      };
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(request);

      await expect(service.getComments('req-2', mockEmployee)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
