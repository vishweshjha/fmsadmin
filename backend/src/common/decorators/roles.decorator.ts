import { SetMetadata } from '@nestjs/common';
import { AdminUserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AdminUserRole[]) => SetMetadata(ROLES_KEY, roles);
