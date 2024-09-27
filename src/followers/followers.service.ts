import { Injectable } from '@nestjs/common';
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
}
