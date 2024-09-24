import { Module } from '@nestjs/common';
import { UserModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma.module';
@Module({
  imports: [AuthModule, UserModule, ConfigModule.forRoot(), PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
