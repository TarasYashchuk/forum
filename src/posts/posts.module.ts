import { Module } from '@nestjs/common';
import { PostService } from './posts.service';
import { PostController } from './posts.controller';
import { PrismaService } from 'src/prisma.service';
import { ImgurService } from 'src/imgur/imgur.service';

@Module({
  controllers: [PostController],
  providers: [PostService, PrismaService, ImgurService],
})
export class PostsModule {}
