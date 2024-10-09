import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async getActionCountByType(
    action: string,
    targetId?: number,
  ): Promise<number> {
    try {
      const count = await this.prisma.actionLog.count({
        where: {
          action,
          ...(targetId ? { targetId } : {}),
        },
      });

      this.logger.log(
        `Successfully fetched action count for action type: ${action}, targetId: ${targetId} - Count: ${count}`,
      );
      return count;
    } catch (error) {
      this.logger.error(
        `Failed to fetch action count for action type: ${action}, targetId: ${targetId} - ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to fetch action count');
    }
  }

  async getUserActionStatistics(userId: number): Promise<any> {
    try {
      const postCreatedCount = await this.prisma.actionLog.count({
        where: {
          action: 'CREATE_POST',
          userId,
        },
      });

      const postViewedCount = await this.prisma.actionLog.count({
        where: {
          action: 'VIEW_POST',
          userId,
        },
      });

      const commentCount = await this.prisma.actionLog.count({
        where: {
          action: 'CREATE_COMMENT',
          userId,
        },
      });

      const likeCount = await this.prisma.actionLog.count({
        where: {
          action: 'LIKE_POST',
          userId,
        },
      });

      const profileViews = await this.prisma.actionLog.count({
        where: {
          action: 'VIEW_USER_PROFILE',
          userId,
        },
      });

      const stats = {
        postsCreated: postCreatedCount,
        postsViewed: postViewedCount,
        comments: commentCount,
        likes: likeCount,
        profileViews,
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
      const totalPostsCreated = await this.getActionCountByType('CREATE_POST');
      const totalPostsViewed = await this.getActionCountByType('VIEW_POST');
      const totalComments = await this.getActionCountByType('CREATE_COMMENT');
      const totalLikes = await this.getActionCountByType('LIKE_POST');
      const totalProfileViews =
        await this.getActionCountByType('VIEW_USER_PROFILE');

      const stats = {
        totalPostsCreated,
        totalPostsViewed,
        totalComments,
        totalLikes,
        totalProfileViews,
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

  async getStatisticsByPeriod(
    userId: number | null,
    actions: string[],
    startDate: Date,
    endDate: Date,
    interval: 'hour' | 'day' | 'week' | 'month' | 'year',
  ): Promise<any> {
    try {
      const intervalMap = {
        hour: 'hour',
        day: 'day',
        week: 'week',
        month: 'month',
        year: 'year',
      };

      if (!intervalMap[interval]) {
        throw new BadRequestException(`Invalid interval: ${interval}`);
      }

      const statistics = await Promise.all(
        actions.map(async (action) => {
          return await this.prisma.$queryRaw<
            { period: Date; count: bigint; events: any[] }[]
          >`
            SELECT DATE_TRUNC(${intervalMap[interval]}, "createdAt") as period,
                   COUNT(*) as count,
                   ARRAY_AGG(JSON_BUILD_OBJECT(
                     'id', "id",
                     'action', "action",
                     'userId', "userId",
                     'postId', "postId",
                     'commentId', "commentId",
                     'likeId', "likeId",
                     'targetId', "targetId",
                     'createdAt', "createdAt"
                   )) as events
            FROM "action_logs"
            WHERE "createdAt" BETWEEN ${startDate} AND ${endDate}
              AND "action" = ${action}
              ${userId ? Prisma.sql`AND "userId" = ${userId}` : Prisma.empty}
            GROUP BY period
            ORDER BY period;
          `;
        }),
      );

      const formattedStatistics = actions.map((action, index) => ({
        action,
        statistics: statistics[index].map((stat) => ({
          period: new Date(stat.period).toISOString(),
          count: Number(stat.count),
          events: stat.events.map((event: any) => ({
            ...event,
            createdAt: new Date(
              new Date(event.createdAt).getTime() + 3 * 60 * 60 * 1000,
            ).toISOString(),
          })),
        })),
      }));

      this.logger.log(
        `Successfully fetched combined statistics for actions "${actions.join(
          ', ',
        )}" from ${startDate.toISOString()} to ${endDate.toISOString()} grouped by ${interval}`,
      );

      return {
        interval,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        combinedStatistics: formattedStatistics,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch combined statistics for period: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to fetch combined statistics for the specified period',
      );
    }
  }
}
