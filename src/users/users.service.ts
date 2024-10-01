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
import { nanoid } from 'nanoid';
import { ImgurService } from 'src/imgur/imgur.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private imgurService: ImgurService,
  ) {}

  async createUser(data: CreateUserDto, avatar?: Buffer): Promise<User> {
    if (data.password !== data.repeatPassword) {
      throw new Error('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    let avatarUrl: string | null = null;

    if (avatar) {
      avatarUrl = await this.imgurService.uploadImage(avatar);
    }

    const userRole = await this.prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      throw new Error('Role "user" not found');
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl,
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
      include: {
        posts: {
          include: {
            comments: {
              include: {
                user: { select: { id: true, username: true } },
                likes: { select: { userId: true } },
              },
            },
            likes: { select: { userId: true } },
          },
        },
        followedBy: {
          include: { follower: { select: { id: true, username: true } } },
        },
        following: {
          include: { following: { select: { id: true, username: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const userWithFollowers = mapFollowersAndFollowing(user);

    return plainToClass(UserDto, userWithFollowers, {
      excludeExtraneousValues: true,
    });
  }

  async findByUsername(username: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        posts: {
          include: {
            comments: {
              include: {
                user: { select: { id: true, username: true } },
                likes: { select: { userId: true } },
              },
            },
            likes: { select: { userId: true } },
          },
        },
        followedBy: {
          include: { follower: { select: { id: true, username: true } } },
        },
        following: {
          include: { following: { select: { id: true, username: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    const userWithFollowers = mapFollowersAndFollowing(user);

    return plainToClass(UserDto, userWithFollowers, {
      excludeExtraneousValues: true,
    });
  }

  async getByUsername(username: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        posts: {
          include: {
            comments: {
              include: {
                user: { select: { id: true, username: true } },
                likes: { select: { userId: true } },
              },
            },
            likes: { select: { userId: true } },
          },
        },
        followedBy: {
          include: { follower: { select: { id: true, username: true } } },
        },
        following: {
          include: { following: { select: { id: true, username: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    const userWithFollowers = mapFollowersAndFollowing(user);

    return userWithFollowers;
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

  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      include: {
        posts: {
          include: {
            comments: {
              include: {
                user: { select: { id: true, username: true } },
                likes: { select: { userId: true } },
              },
            },
            likes: { select: { userId: true } },
          },
        },
        followedBy: {
          include: { follower: { select: { id: true, username: true } } },
        },
        following: {
          include: { following: { select: { id: true, username: true } } },
        },
      },
    });

    const usersWithFollowers = users.map((user) =>
      mapFollowersAndFollowing(user),
    );
    return plainToInstance(UserDto, usersWithFollowers, {
      excludeExtraneousValues: true,
    });
  }

  async getUserById(id: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          include: {
            comments: {
              include: {
                user: { select: { id: true, username: true } },
                likes: { select: { userId: true } },
              },
            },
            likes: { select: { userId: true } },
          },
        },
        followedBy: {
          include: { follower: { select: { id: true, username: true } } },
        },
        following: {
          include: { following: { select: { id: true, username: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const userWithFollowers = mapFollowersAndFollowing(user);
    return plainToClass(UserDto, userWithFollowers, {
      excludeExtraneousValues: true,
    });
  }

  async updateAvatar(userId: number, avatar: Buffer): Promise<UserDto> {
    const avatarUrl = await this.imgurService.uploadImage(avatar);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return plainToClass(UserDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }
}

function mapFollowersAndFollowing(user: any): any {
  const followers = user.followedBy.map((f: any) => ({
    id: f.follower.id,
    username: f.follower.username,
  }));

  const following = user.following.map((f: any) => ({
    id: f.following.id,
    username: f.following.username,
  }));

  return {
    ...user,
    followers,
    following,
  };
}
