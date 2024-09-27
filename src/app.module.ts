import { Module } from '@nestjs/common';
import { UserModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comment.module';
@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot(),
    PrismaModule,
    PostsModule,
    CommentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
