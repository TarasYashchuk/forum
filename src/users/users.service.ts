import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { Prisma, User } from '@prisma/client';
import { UserDto } from './dto/user-responce.dto';
import { plainToClass, plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
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

  async validateUserPassword(email: string, password: string): Promise<User> {
    const user = await this.getUserByEmail(email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    return user;
  }

  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany();
    return plainToInstance(UserDto, users, { excludeExtraneousValues: true });
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }

  async changeUserPassword(id: number, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async updateUserProfile(
    id: number,
    profileData: { avatarUrl?: string; bio?: string },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: profileData,
    });
  }

  async getUserById(id: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return plainToClass(UserDto, user, { excludeExtraneousValues: true });
  }
}
