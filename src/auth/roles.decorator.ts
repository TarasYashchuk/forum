// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roleIds: number[]) => SetMetadata('roles', roleIds);
