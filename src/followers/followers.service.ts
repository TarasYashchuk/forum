import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FollowersService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async followUser(followerId: number, followingId: number) {
    const methodName = this.followUser.name;
    this.logger.log(
      `Start method ${methodName} executed by user with id ${followerId}`,
    );
    this.logger.log(
      `User with id ${followerId} is attempting to follow user with id  ${followingId}`,
    );

    try {
      const follow = await this.prisma.follower.create({
        data: {
          followerId,
          followingId,
        },
      });

      this.logger.log(
        `User with id  ${followerId} successfully followed user with id ${followingId}`,
      );
      await this.logger.logAction('FOLLOW_USER', followerId);
      return follow;
    } catch (error) {
      this.logger.error(
        `Error when user with id ${followerId} tried to follow user with id ${followingId}: ${error.message}`,
      );
      throw error;
    }
  }

  async unfollowUser(followerId: number, followingId: number) {
    const methodName = this.unfollowUser.name;
    this.logger.log(
      `Start method ${methodName} executed by user with id ${followerId}`,
    );
    this.logger.log(
      `User with id ${followerId} is attempting to unfollow user with id ${followingId}`,
    );

    try {
      if (followerId === followingId) {
        throw new BadRequestException('You cannot unfollow yourself');
      }

      const followRecord = await this.prisma.follower.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      if (!followRecord) {
        throw new NotFoundException(
          `You are not following the user with ID with id ${followingId}`,
        );
      }

      const unfollow = await this.prisma.follower.deleteMany({
        where: {
          followerId,
          followingId,
        },
      });

      this.logger.log(
        `User with id ${followerId} successfully unfollowed user with id ${followingId}`,
      );
      await this.logger.logAction('UNFOLLOW_USER', followerId);
      return unfollow;
    } catch (error) {
      this.logger.error(
        `Error when user with id ${followerId} tried to unfollow user with id ${followingId}: ${error.message}`,
      );
      throw error;
    }
  }

  async getFollowers(userId: number) {
    const methodName = this.getFollowers.name;
    this.logger.log(
      `Start method ${methodName} executed by user with id ${userId}`,
    );
    this.logger.log(`Fetching followers for user with id ${userId}`);

    try {
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const followers = await this.prisma.follower.findMany({
        where: { followingId: userId },
        include: {
          follower: { select: { id: true, username: true } },
        },
      });

      this.logger.log(
        `Followers for user with id ${userId} fetched successfully:`,
      );
      return followers;
    } catch (error) {
      this.logger.error(
        `Error fetching followers for user with id ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async getFollowing(userId: number) {
    const methodName = this.getFollowing.name;
    this.logger.log(
      `Start method ${methodName} executed by user with id ${userId}`,
    );
    this.logger.log(`Fetching following users for user with id ${userId}`);
    try {
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const following = await this.prisma.follower.findMany({
        where: { followerId: userId },
        include: {
          following: { select: { id: true, username: true } },
        },
      });

      this.logger.log(
        `Following users for user with id ${userId} fetched successfully`,
      );
      return following;
    } catch (error) {
      this.logger.error(
        `Error fetching following users for user with id ${userId}: ${error.message}`,
      );
      throw error;
    }
  }
}
