import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import config from '../config/jwt.config';
import { UserService } from 'src/users/users.service';
import { PrismaModule } from '../prisma.module';
import { PrismaService } from 'src/prisma.service';
import { PasswordResetService } from './password-reset.service';
import { MailModule } from './mail/mail.module';
import { ImgurService } from 'src/imgur/imgur.service';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    MailModule,
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: config.jwtExpiresIn },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    UserService,
    PrismaService,
    PasswordResetService,
    ImgurService,
    GoogleStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
