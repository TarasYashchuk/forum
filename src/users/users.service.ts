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
import { OAuthUserDto } from './dto/oauth-user.dto';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private imgurService: ImgurService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createUser(data: CreateUserDto, avatar?: Buffer): Promise<User> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      if (data.password !== data.repeatPassword) {
        throw new Error('Passwords do not match');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      let avatarUrl: string | null = null;

      if (avatar) {
        this.logger.log('Uploading avatar to Imgur');
        avatarUrl = await this.imgurService.uploadImage(avatar);
      }

      const userRole = await this.prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (!userRole) {
        throw new Error('Role "user" not found');
      }

      const newUser = await this.prisma.user.create({
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

      this.logger.log(`User created successfully with ID ${newUser.id}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<UserDto> {
    try {
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

      this.logger.log(`User with email ${email} fetched successfully`);
      return plainToClass(UserDto, userWithFollowers, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch user by email ${email}: ${error.message}`,
      );
      throw error;
    }
  }

  async findByUsername(username: string): Promise<UserDto> {
    try {
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

      this.logger.log(`User with username ${username} fetched successfully`);
      return plainToClass(UserDto, userWithFollowers, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch user by username ${username}: ${error.message}`,
      );
      throw error;
    }
  }

  async getByUsername(username: string): Promise<any> {
    try {
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

      this.logger.log(`User with username ${username} fetched successfully`);
      return userWithFollowers;
    } catch (error) {
      this.logger.error(
        `Failed to fetch user by username ${username}: ${error.message}`,
      );
      throw error;
    }
  }

  async updateUser(id: number, data: Prisma.UserUpdateInput): Promise<UserDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      this.logger.log(`User with ID ${id} updated successfully`);
      return plainToClass(UserDto, user, { excludeExtraneousValues: true });
    } catch (error) {
      this.logger.error(
        `Failed to update user with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteUser(id: number): Promise<UserDto> {
    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      this.logger.log(`User with ID ${id} deleted successfully`);
      return plainToClass(UserDto, user);
    } catch (error) {
      this.logger.error(
        `Failed to delete user with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async getAllUsers(): Promise<UserDto[]> {
    try {
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

      this.logger.log(`Fetched all users successfully`);
      return plainToInstance(UserDto, usersWithFollowers, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(`Failed to fetch all users: ${error.message}`);
      throw error;
    }
  }

  async getUserById(id: number): Promise<UserDto> {
    try {
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

      this.logger.log(`User with ID ${id} fetched successfully`);
      return plainToClass(UserDto, userWithFollowers, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(`Failed to fetch user with ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async updateAvatar(userId: number, avatar: Buffer): Promise<UserDto> {
    try {
      const avatarUrl = await this.imgurService.uploadImage(avatar);

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
      });

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      this.logger.log(`Avatar for user with ID ${userId} updated successfully`);
      return plainToClass(UserDto, updatedUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(
        `Failed to update avatar for user with ID ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async createOAuthUser(oauthUser: OAuthUserDto): Promise<User> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: oauthUser.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const userRole = await this.prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (!userRole) {
        throw new Error('Role "user" not found');
      }

      const newUser = await this.prisma.user.create({
        data: {
          email: oauthUser.email,
          username: oauthUser.email.split('@')[0],
          password: '',
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          avatarUrl: oauthUser.avatarUrl,
          role: { connect: { id: userRole.id } },
        },
      });

      this.logger.log(`OAuth user created successfully with ID ${newUser.id}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Failed to create OAuth user: ${error.message}`);
      throw error;
    }
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
