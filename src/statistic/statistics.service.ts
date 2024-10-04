import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActionCountByType(action: string): Promise<number> {
    const count = await this.prisma.actionLog.count({
      where: {
        action: action,
      },
    });
    return count;
  }

  async getUserActionStatistics(userId: number): Promise<any> {
    const postCreatedCount = await this.prisma.actionLog.count({
      where: {
        action: 'CREATE_POST',
        userId: userId,
      },
    });

    const postViewedCount = await this.prisma.actionLog.count({
      where: {
        action: 'VIEW_POST',
        userId: userId,
      },
    });

    const commentCount = await this.prisma.actionLog.count({
      where: {
        action: 'CREATE_COMMENT',
        userId: userId,
      },
    });

    const likeCount = await this.prisma.actionLog.count({
      where: {
        action: 'LIKE_POST',
        userId: userId,
      },
    });

    return {
      postsCreated: postCreatedCount,
      postsViewed: postViewedCount,
      comments: commentCount,
      likes: likeCount,
    };
  }

  async getGlobalActionStatistics(): Promise<any> {
    const totalPostsCreated = await this.getActionCountByType('CREATE_POST');
    const totalPostsViewed = await this.getActionCountByType('VIEW_POST');
    const totalComments = await this.getActionCountByType('CREATE_COMMENT');
    const totalLikes = await this.getActionCountByType('LIKE_POST');

    return {
      totalPostsCreated,
      totalPostsViewed,
      totalComments,
      totalLikes,
    };
  }
}
