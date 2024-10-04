import { Module } from '@nestjs/common';
import { PostService } from './posts.service';
import { PostController } from './posts.controller';
import { PrismaService } from 'src/prisma.service';
import { ImgurService } from 'src/imgur/imgur.service';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';

@Module({
  controllers: [PostController],
  providers: [PostService, PrismaService, ImgurService, WinstonLoggerService],
})
export class PostsModule {}
