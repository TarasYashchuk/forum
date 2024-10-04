import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async getActionCountByType(action: string): Promise<number> {
    try {
      this.logger.log(`Fetching action count for action type: ${action}`);
      const count = await this.prisma.actionLog.count({
        where: {
          action: action,
        },
      });
      this.logger.log(
        `Successfully fetched action count for action type: ${action} - Count: ${count}`,
      );
      return count;
    } catch (error) {
      this.logger.error(
        `Failed to fetch action count for action type: ${action} - ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to fetch action count');
    }
  }

  async getUserActionStatistics(userId: number): Promise<any> {
    try {
      this.logger.log(`Fetching action statistics for user with ID: ${userId}`);
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

      const stats = {
        postsCreated: postCreatedCount,
        postsViewed: postViewedCount,
        comments: commentCount,
        likes: likeCount,
      };

      this.logger.log(
        `Successfully fetched user action statistics for user with ID: ${userId} - ${JSON.stringify(stats)}`,
      );
      return stats;
    } catch (error) {
      this.logger.error(
        `Failed to fetch user action statistics for user with ID: ${userId} - ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to fetch user action statistics',
      );
    }
  }

  async getGlobalActionStatistics(): Promise<any> {
    try {
      this.logger.log('Fetching global action statistics');
      const totalPostsCreated = await this.getActionCountByType('CREATE_POST');
      const totalPostsViewed = await this.getActionCountByType('VIEW_POST');
      const totalComments = await this.getActionCountByType('CREATE_COMMENT');
      const totalLikes = await this.getActionCountByType('LIKE_POST');

      const stats = {
        totalPostsCreated,
        totalPostsViewed,
        totalComments,
        totalLikes,
      };

      this.logger.log(
        `Successfully fetched global action statistics - ${JSON.stringify(stats)}`,
      );
      return stats;
    } catch (error) {
      this.logger.error(
        `Failed to fetch global action statistics - ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to fetch global action statistics',
      );
    }
  }
}
