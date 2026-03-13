import { SetMetadata } from '@nestjs/common';
import { EharsUserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: EharsUserRole[]) =>
  SetMetadata(ROLES_KEY, roles);
