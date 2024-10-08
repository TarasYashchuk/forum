import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [StatisticsController],
  providers: [WinstonLoggerService, StatisticsService, PrismaService],
})
export class StatisticModule {}
