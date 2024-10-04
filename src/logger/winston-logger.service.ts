import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as winston from 'winston';

@Injectable()
export class WinstonLoggerService {
  private logger: winston.Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
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
  ) {
    await this.prisma.actionLog.create({
      data: {
        action,
        userId,
        postId,
        commentId,
        createdAt: new Date(),
      },
    });
    this.logger.info(`Action "${action}" logged for user with id ${userId}`);
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
