import { Module } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { FollowersController } from './followers.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [FollowersService, PrismaService],
  controllers: [FollowersController],
})
export class FollowersModule {}
