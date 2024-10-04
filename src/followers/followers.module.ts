import { Module } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { FollowersController } from './followers.controller';
import { PrismaService } from 'src/prisma.service';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';

@Module({
  providers: [FollowersService, PrismaService, WinstonLoggerService],
  controllers: [FollowersController],
})
export class FollowersModule {}
