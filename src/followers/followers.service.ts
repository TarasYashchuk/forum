import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FollowersService {
  constructor(private prisma: PrismaService) {}

  async followUser(followerId: number, followingId: number) {
    return this.prisma.follower.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  async unfollowUser(followerId: number, followingId: number) {
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
        `You are not following the user with ID ${followingId}`,
      );
    }

    return this.prisma.follower.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });
  }

  async getFollowers(userId: number) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.follower.findMany({
      where: { followingId: userId },
      include: {
        follower: { select: { id: true, username: true } },
      },
    });
  }
}
