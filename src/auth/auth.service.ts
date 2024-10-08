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
    try {
      const user = await this.userService.getByUsername(username);

      if (!user) {
        return null;
      }

      if (!user.password) {
        throw new Error('Password is missing for the user');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error(`Invalid password for user: ${username}`);
      }

      this.logger.log(`User validated successfully: ${username}`);
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(
        `Error occurred while validating user: ${username}. Error: ${error.message}`,
      );
      throw new Error('Validation failed');
    }
  }

  async login(user: any) {
    try {
      const payload: JwtPayload = {
        username: user.username,
        id: user.id,
        roleId: user.roleId,
      };
      const token = this.jwtService.sign(payload);
      this.logger.log(`JWT token generated for user: ${user.username}`);
      return { access_token: token };
    } catch (error) {
      this.logger.error(
        `Failed to log in user: ${user.username}. Error: ${error.message}`,
      );
      throw new Error('Login failed');
    }
  }

  generateJwtToken(user: UserDto): string {
    try {
      if (!user || !user.id || !user.username) {
        throw new Error('Cannot generate token: Invalid user data');
      }
      const payload = {
        username: user.username,
        sub: user.id,
        roleId: user.roleId,
      };
      const token = this.jwtService.sign(payload);
      this.logger.log(`JWT generated successfully for user: ${user.username}`);
      return token;
    } catch (error) {
      this.logger.error(
        `Failed to generate JWT for user: ${user.username}. Error: ${error.message}`,
      );
      throw new Error('JWT generation failed');
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    this.logger.log(`Searching for user by email: ${email}`);
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      return user;
    } catch (error) {
      this.logger.error(
        `Error occurred while searching for user by email: ${email}. Error: ${error.message}`,
      );
      throw new Error('User search failed');
    }
  }

  async validateOAuthUser(
    oauthUser: OAuthUserDto,
  ): Promise<{ user: UserDto; token: string }> {
    try {
      let userFromDb = await this.findUserByEmail(oauthUser.email);

      if (!userFromDb) {
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
    } catch (error) {
      this.logger.error(
        `Failed to validate OAuth user with email: ${oauthUser.email}. Error: ${error.message}`,
      );
      throw new Error('OAuth validation failed');
    }
  }
}
