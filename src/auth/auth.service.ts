import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from 'src/config/jwt.config';
import { PrismaService } from 'src/prisma.service';
import { OAuthUserDto } from 'src/users/dto/oauth-user.dto';
import { UserDto } from 'src/users/dto/user-responce.dto';
import { UserService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
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

  generateJwtToken(user: UserDto): string {
    if (!user || !user.id || !user.username) {
      throw new Error('Cannot generate token: Invalid user data');
    }
    const payload = {
      username: user.username,
      sub: user.id,
      roleId: user.roleId,
    };
    return this.jwtService.sign(payload);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async validateOAuthUser(
    oauthUser: OAuthUserDto,
  ): Promise<{ user: UserDto; token: string }> {
    let userFromDb = await this.findUserByEmail(oauthUser.email);

    if (!userFromDb) {
      userFromDb = await this.userService.createOAuthUser(oauthUser);
    }

    const userDto = plainToInstance(UserDto, userFromDb, {
      excludeExtraneousValues: true,
    });
    const token = this.generateJwtToken(userDto);

    return { user: userDto, token };
  }
}
