import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  RequestPriority,
  RequestStatus,
  RequestType,
  EharsUserRole,
} from '@prisma/client';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

const mockPrisma = {
  serviceRequest: {
    count: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  eharsUser: {
    upsert: jest.fn(),
  },
  requestStatusHistory: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
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

describe('RequestsService', () => {
  let service: RequestsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  // ── create ─────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('should create a service request and return it', async () => {
      const dto: CreateRequestDto = {
        title: 'Need a new laptop',
        description: 'My current laptop is broken',
        type: RequestType.ASSET_REQUEST,
        priority: RequestPriority.HIGH,
      };

      const dbUser = {
        id: 'user-1',
        email: mockEmployee.email,
        name: mockEmployee.name,
        role: EharsUserRole.EMPLOYEE,
      };
      const createdRequest = {
        id: 'req-1',
        requestNumber: 'SR-00001',
        ...dto,
        status: RequestStatus.PENDING,
        requesterId: dbUser.id,
        requester: dbUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.eharsUser.upsert.mockResolvedValue(dbUser);
      // $transaction receives an async callback; simulate it by calling the fn
      mockPrisma.$transaction.mockImplementation(
        async (
          fn: (tx: typeof mockPrisma) => Promise<typeof createdRequest>,
        ) => {
          const txMock = {
            serviceRequest: {
              count: jest.fn().mockResolvedValue(0),
              create: jest.fn().mockResolvedValue(createdRequest),
            },
          };
          return fn(txMock as unknown as typeof mockPrisma);
        },
      );
      mockPrisma.requestStatusHistory.create.mockResolvedValue({});

      const result = await service.create(dto, mockEmployee);
      expect(result.requestNumber).toBe('SR-00001');
      expect(result.requesterId).toBe(dbUser.id);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return request for the owning employee', async () => {
      const mockRequest = {
        id: 'req-1',
        requester: {
          email: mockEmployee.email,
          id: 'user-1',
          name: 'Employee',
          role: EharsUserRole.EMPLOYEE,
        },
        approvals: [],
        comments: [],
        statusHistory: [],
      };
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(mockRequest);

      const result = await service.findOne('req-1', mockEmployee);
      expect(result.id).toBe('req-1');
    });

    it('should throw ForbiddenException when employee tries to view another user request', async () => {
      const mockRequest = {
        id: 'req-2',
        requester: {
          email: 'other@example.com',
          id: 'user-2',
          name: 'Other',
          role: EharsUserRole.EMPLOYEE,
        },
        approvals: [],
        comments: [],
        statusHistory: [],
      };
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(mockRequest);

      await expect(service.findOne('req-2', mockEmployee)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when request does not exist', async () => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(null);
      await expect(
        service.findOne('non-existent', mockEmployee),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow agent to view any request', async () => {
      const mockRequest = {
        id: 'req-3',
        requester: {
          email: 'other@example.com',
          id: 'user-3',
          name: 'Other',
          role: EharsUserRole.EMPLOYEE,
        },
        approvals: [],
        comments: [],
        statusHistory: [],
      };
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(mockRequest);

      const result = await service.findOne('req-3', mockAgent);
      expect(result.id).toBe('req-3');
    });
  });

  // ── updateRequest ──────────────────────────────────────────────────────────
  describe('updateRequest', () => {
    it('should update status to IN_PROGRESS for agent', async () => {
      const existing = {
        id: 'req-1',
        status: RequestStatus.APPROVED,
        requesterId: 'user-1',
      };
      const dbUser = {
        id: 'agent-1',
        email: mockAgent.email,
        name: mockAgent.name,
        role: EharsUserRole.IT_AGENT,
      };
      const updated = { ...existing, status: RequestStatus.IN_PROGRESS };

      mockPrisma.serviceRequest.findUnique.mockResolvedValue(existing);
      mockPrisma.eharsUser.upsert.mockResolvedValue(dbUser);
      mockPrisma.$transaction.mockResolvedValue([updated]);

      const dto: UpdateRequestDto = { status: RequestStatus.IN_PROGRESS };
      const result = await service.updateRequest('req-1', dto, mockAgent);
      expect(result.status).toBe(RequestStatus.IN_PROGRESS);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const existing = {
        id: 'req-1',
        status: RequestStatus.CLOSED,
        requesterId: 'user-1',
      };
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(existing);
      mockPrisma.eharsUser.upsert.mockResolvedValue({
        id: 'agent-1',
        email: mockAgent.email,
        name: mockAgent.name,
        role: EharsUserRole.IT_AGENT,
      });

      const dto: UpdateRequestDto = { status: RequestStatus.PENDING };
      await expect(
        service.updateRequest('req-1', dto, mockAgent),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when employee tries to set IN_PROGRESS', async () => {
      const existing = {
        id: 'req-1',
        status: RequestStatus.APPROVED,
        requesterId: 'user-1',
      };
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(existing);
      mockPrisma.eharsUser.upsert.mockResolvedValue({
        id: 'user-1',
        email: mockEmployee.email,
        name: mockEmployee.name,
        role: EharsUserRole.EMPLOYEE,
      });

      const dto: UpdateRequestDto = { status: RequestStatus.IN_PROGRESS };
      await expect(
        service.updateRequest('req-1', dto, mockEmployee),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── cancel ─────────────────────────────────────────────────────────────────
  describe('cancel', () => {
    it('should cancel a pending request owned by the employee', async () => {
      const dbUser = {
        id: 'user-1',
        email: mockEmployee.email,
        name: mockEmployee.name,
        role: EharsUserRole.EMPLOYEE,
      };
      const existing = {
        id: 'req-1',
        status: RequestStatus.PENDING,
        requesterId: dbUser.id,
      };

      mockPrisma.serviceRequest.findUnique.mockResolvedValue(existing);
      mockPrisma.eharsUser.upsert.mockResolvedValue(dbUser);
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      const result = await service.cancel('req-1', mockEmployee);
      expect(result.message).toBe('Request cancelled successfully');
    });

    it('should throw ForbiddenException when employee cancels another user request', async () => {
      const dbUser = {
        id: 'user-1',
        email: mockEmployee.email,
        name: mockEmployee.name,
        role: EharsUserRole.EMPLOYEE,
      };
      const existing = {
        id: 'req-2',
        status: RequestStatus.PENDING,
        requesterId: 'other-user-id',
      };

      mockPrisma.serviceRequest.findUnique.mockResolvedValue(existing);
      mockPrisma.eharsUser.upsert.mockResolvedValue(dbUser);

      await expect(service.cancel('req-2', mockEmployee)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when cancelling a CLOSED request', async () => {
      const dbUser = {
        id: 'user-1',
        email: mockEmployee.email,
        name: mockEmployee.name,
        role: EharsUserRole.EMPLOYEE,
      };
      const existing = {
        id: 'req-1',
        status: RequestStatus.CLOSED,
        requesterId: dbUser.id,
      };

      mockPrisma.serviceRequest.findUnique.mockResolvedValue(existing);
      mockPrisma.eharsUser.upsert.mockResolvedValue(dbUser);

      await expect(service.cancel('req-1', mockEmployee)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
