import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { ImgurService } from 'src/imgur/imgur.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, ImgurService],
  exports: [UserService],
})
export class UserModule {}
