import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalsService } from './approvals.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApprovalDecision,
  EharsUserRole,
  RequestStatus,
  RequestType,
  RequestPriority,
} from '@prisma/client';
import { ApproveRequestDto } from './dto/approve-request.dto';

const mockPrisma = {
  serviceRequest: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  eharsUser: {
    upsert: jest.fn(),
  },
  requestApproval: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  requestStatusHistory: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockManager = {
  sub: 'manager-1',
  email: 'manager@example.com',
  role: EharsUserRole.MANAGER,
  name: 'Test Manager',
};

const mockEmployee = {
  sub: 'user-1',
  email: 'employee@example.com',
  role: EharsUserRole.EMPLOYEE,
  name: 'Test Employee',
};

describe('ApprovalsService', () => {
  let service: ApprovalsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ApprovalsService>(ApprovalsService);
  });

  // ── approve ────────────────────────────────────────────────────────────────
  describe('approve', () => {
    const pendingRequest = {
      id: 'req-1',
      status: RequestStatus.PENDING,
      type: RequestType.IT_SUPPORT,
      priority: RequestPriority.MEDIUM,
    };

    it('should approve a pending request as manager', async () => {
      const dbUser = {
        id: 'manager-1',
        email: mockManager.email,
        name: mockManager.name,
        role: EharsUserRole.MANAGER,
      };
      const approval = {
        id: 'approval-1',
        requestId: 'req-1',
        approverId: dbUser.id,
        decision: ApprovalDecision.APPROVED,
        approver: dbUser,
        createdAt: new Date(),
      };

      mockPrisma.serviceRequest.findUnique.mockResolvedValue(pendingRequest);
      mockPrisma.eharsUser.upsert.mockResolvedValue(dbUser);
      mockPrisma.$transaction.mockResolvedValue([approval]);

      const dto: ApproveRequestDto = { decision: ApprovalDecision.APPROVED };
      const result = await service.approve('req-1', dto, mockManager);
      expect(result.decision).toBe(ApprovalDecision.APPROVED);
    });

    it('should reject a pending request as manager', async () => {
      const dbUser = {
        id: 'manager-1',
        email: mockManager.email,
        name: mockManager.name,
        role: EharsUserRole.MANAGER,
      };
      const approval = {
        id: 'approval-1',
        requestId: 'req-1',
        approverId: dbUser.id,
        decision: ApprovalDecision.REJECTED,
        comments: 'Not justified',
        approver: dbUser,
        createdAt: new Date(),
      };

      mockPrisma.serviceRequest.findUnique.mockResolvedValue(pendingRequest);
      mockPrisma.eharsUser.upsert.mockResolvedValue(dbUser);
      mockPrisma.$transaction.mockResolvedValue([approval]);

      const dto: ApproveRequestDto = {
        decision: ApprovalDecision.REJECTED,
        comments: 'Not justified',
      };
      const result = await service.approve('req-1', dto, mockManager);
      expect(result.decision).toBe(ApprovalDecision.REJECTED);
    });

    it('should throw ForbiddenException when employee tries to approve', async () => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(pendingRequest);

      const dto: ApproveRequestDto = { decision: ApprovalDecision.APPROVED };
      await expect(service.approve('req-1', dto, mockEmployee)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when request does not exist', async () => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(null);

      const dto: ApproveRequestDto = { decision: ApprovalDecision.APPROVED };
      await expect(
        service.approve('non-existent', dto, mockManager),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when request is not in PENDING state', async () => {
      const approvedRequest = {
        ...pendingRequest,
        status: RequestStatus.APPROVED,
      };
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(approvedRequest);

      const dto: ApproveRequestDto = { decision: ApprovalDecision.APPROVED };
      await expect(service.approve('req-1', dto, mockManager)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── getApprovals ───────────────────────────────────────────────────────────
  describe('getApprovals', () => {
    it('should return approvals for the request owner', async () => {
      const request = {
        id: 'req-1',
        requesterId: 'user-1',
        requester: { email: mockEmployee.email },
      };
      const approvals = [
        {
          id: 'approval-1',
          requestId: 'req-1',
          decision: ApprovalDecision.APPROVED,
          approver: {
            id: 'manager-1',
            name: 'Manager',
            email: 'manager@example.com',
            role: EharsUserRole.MANAGER,
          },
          createdAt: new Date(),
        },
      ];

      mockPrisma.serviceRequest.findUnique.mockResolvedValue(request);
      mockPrisma.requestApproval.findMany.mockResolvedValue(approvals);

      const result = await service.getApprovals('req-1', mockEmployee);
      expect(result).toHaveLength(1);
    });

    it('should throw ForbiddenException when employee tries to view approvals of another request', async () => {
      const request = {
        id: 'req-2',
        requesterId: 'other-user',
        requester: { email: 'other@example.com' },
      };
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(request);

      await expect(service.getApprovals('req-2', mockEmployee)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
