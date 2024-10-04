import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { ImgurService } from 'src/imgur/imgur.service';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, ImgurService, WinstonLoggerService],
  exports: [UserService],
})
export class UserModule {}
