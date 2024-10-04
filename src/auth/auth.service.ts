import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from 'src/config/jwt.config';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
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
    private readonly logger: WinstonLoggerService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    this.logger.log(`Validating user: ${username}`);
    const user = await this.userService.getByUsername(username);

    if (!user) {
      this.logger.warn(`User not found: ${username}`);
      return null;
    }

    if (!user.password) {
      this.logger.error(`Password is missing for user: ${username}`);
      throw new Error('Password is missing for the user');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${username}`);
      return null;
    }

    this.logger.log(`User validated successfully: ${username}`);
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    this.logger.log(`User ${user.username} is logging in`);
    const payload: JwtPayload = {
      username: user.username,
      id: user.id,
      roleId: user.roleId,
    };
    const token = this.jwtService.sign(payload);
    this.logger.log(`JWT token generated for user: ${user.username}`);
    return { access_token: token };
  }

  generateJwtToken(user: UserDto): string {
    if (!user || !user.id || !user.username) {
      this.logger.error('Invalid user data for JWT generation');
      throw new Error('Cannot generate token: Invalid user data');
    }
    this.logger.log(`Generating JWT for user: ${user.username}`);
    const payload = {
      username: user.username,
      sub: user.id,
      roleId: user.roleId,
    };
    const token = this.jwtService.sign(payload);
    this.logger.log(`JWT generated successfully for user: ${user.username}`);
    return token;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      this.logger.log(`User found: ${email}`);
    } else {
      this.logger.warn(`User not found: ${email}`);
    }
    return user;
  }

  async validateOAuthUser(
    oauthUser: OAuthUserDto,
  ): Promise<{ user: UserDto; token: string }> {
    this.logger.log(`Validating OAuth user: ${oauthUser.email}`);
    let userFromDb = await this.findUserByEmail(oauthUser.email);

    if (!userFromDb) {
      this.logger.log(
        `Creating new user from OAuth for email: ${oauthUser.email}`,
      );
      userFromDb = await this.userService.createOAuthUser(oauthUser);
    }

    const userDto = plainToInstance(UserDto, userFromDb, {
      excludeExtraneousValues: true,
    });
    const token = this.generateJwtToken(userDto);
    this.logger.log(
      `OAuth user validated and JWT generated: ${oauthUser.email}`,
    );

    return { user: userDto, token };
  }
}
