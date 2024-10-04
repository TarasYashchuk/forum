import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';

@Module({
  imports: [PrismaModule],
  providers: [CommentService, WinstonLoggerService],
  controllers: [CommentController],
})
export class CommentsModule {}
