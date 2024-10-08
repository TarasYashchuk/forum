import { Module } from '@nestjs/common';
import { ImgurService } from './imgur.service';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ImgurService, WinstonLoggerService, PrismaService],
  exports: [ImgurService],
})
export class ImgurModule {}
