import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [MailService, WinstonLoggerService, PrismaService],
  exports: [MailService],
})
export class MailModule {}
