import { Module } from '@nestjs/common';
import { UserModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comment.module';
import { FollowersModule } from './followers/followers.module';
import { ImgurService } from './imgur/imgur.service';
import { ImgurModule } from './imgur/imgur.module';
import { StatisticsController } from './statistic/statistics.controller';
import { StatisticsService } from './statistic/statistics.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot(),
    PrismaModule,
    PostsModule,
    CommentsModule,
    FollowersModule,
    ImgurModule,
  ],
  controllers: [StatisticsController],
  providers: [ImgurService, StatisticsService],
})
export class AppModule {}
