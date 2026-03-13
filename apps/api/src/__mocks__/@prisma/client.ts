/**
 * Manual Jest mock for @prisma/client.
 * Provides enum values and type stubs for unit testing without a real database.
 */

export enum EharsUserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  IT_AGENT = 'IT_AGENT',
  FACILITIES_AGENT = 'FACILITIES_AGENT',
  HR_HEAD = 'HR_HEAD',
  IT_HEAD = 'IT_HEAD',
  ADMIN_HEAD = 'ADMIN_HEAD',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

export enum RequestType {
  IT_SUPPORT = 'IT_SUPPORT',
  ASSET_REQUEST = 'ASSET_REQUEST',
  FACILITY_REQUEST = 'FACILITY_REQUEST',
  HR_REQUEST = 'HR_REQUEST',
  OTHER = 'OTHER',
}

export enum RequestPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum ApprovalDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export const PrismaClient = jest.fn().mockImplementation(() => ({}));
