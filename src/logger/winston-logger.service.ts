import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as winston from 'winston';

@Injectable()
export class WinstonLoggerService {
  private logger: winston.Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: () => {
            const date = new Date();
            const offset = 3 * 60 * 60 * 1000;
            const localDate = new Date(date.getTime() + offset);
            return localDate.toISOString();
          },
        }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  async logAction(
    action: string,
    userId: number,
    postId?: number,
    commentId?: number,
    targetId?: number,
  ) {
    try {
      await this.prisma.actionLog.create({
        data: {
          action,
          userId,
          postId,
          commentId,
          targetId,
          createdAt: new Date(),
        },
      });
      this.logger.info(
        `Action "${action}" logged for user with id ${userId}${
          targetId ? ` targeting user with id ${targetId}` : ''
        }`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to log action "${action}" for user with id ${userId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to log action. Please try again later.',
      );
    }
  }

  log(message: string, context?: any) {
    this.logger.info(message, { context });
  }

  error(message: string) {
    this.logger.error(message);
  }

  warn(message: string, context?: any) {
    this.logger.warn(message, { context });
  }
}
