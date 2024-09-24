// src/auth/roles.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class RolesGuard extends JwtAuthGuard {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<number[]>(
      'roles',
      context.getHandler(),
    );
    console.log('Required roles:', requiredRoles);

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('User roleId:', user?.roleId);

    if (!user || !requiredRoles.includes(user.roleId)) {
      throw new UnauthorizedException('Access denied');
    }

    return true;
  }
}
