import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { Prisma, User } from '@prisma/client';
import { UserDto } from './dto/user-responce.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';
import { UserSearchDto } from './dto/user-search.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: CreateUserDto): Promise<User> {
    if (data.password !== data.repeatPassword) {
      throw new Error('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userRole = await this.prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      throw new Error('Role "admin" not found');
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
        role: {
          connect: { id: userRole.id },
        },
      },
    });
  }

  async getUserByEmail(email: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return plainToClass(UserDto, user, { excludeExtraneousValues: true });
  }

  async findByUsername(username: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return plainToClass(UserDto, user, { excludeExtraneousValues: true });
  }

  async getByUsername(username: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  async updateUser(id: number, data: Prisma.UserUpdateInput): Promise<UserDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return plainToClass(UserDto, user, { excludeExtraneousValues: true });
  }

  async deleteUser(id: number): Promise<UserDto> {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return plainToClass(UserDto, user);
  }

  // TODO

  /* async validateUserPassword(email: string, password: string): Promise<User> {
    const user = await this.getUserByEmail(email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    return user;
  } */

  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany();
    return plainToInstance(UserDto, users, { excludeExtraneousValues: true });
  }

  async changeUserPassword(id: number, newPassword: string): Promise<User> {
    if (newPassword.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`Changing password for user ID: ${id}`);

    const userId = parseInt(id.toString(), 10);

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async updateUserPassword(
    userId: number,
    hashedPassword: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  // TODO

  /* async updateUserProfile(
    id: number,
    profileData: { avatarUrl?: string; bio?: string },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: profileData,
    });
  } */

  async getUserById(id: number): Promise<UserDto> {
    if (!id) {
      throw new Error('User ID must be provided');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return plainToClass(UserDto, user, { excludeExtraneousValues: true });
  }
}
