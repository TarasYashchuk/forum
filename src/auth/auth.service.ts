import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from 'src/config/jwt.config';
import { UserService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.getByUsername(username);

    if (!user) {
      return null;
    }

    if (!user.password) {
      throw new Error('Password is missing for the user');
    }

    if (!password) {
      throw new Error('Password not provided in login request');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload: JwtPayload = {
      username: user.username,
      id: user.id,
      roleId: user.roleId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
