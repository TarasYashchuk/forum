import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/users/users.service';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createPasswordResetToken(userId: number): Promise<string> {
    this.logger.log(
      `Creating password reset token for user with ID: ${userId}`,
    );
    try {
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await this.prisma.passwordResetToken.create({
        data: {
          token,
          userId,
          expiresAt,
        },
      });

      this.logger.log(
        `Password reset token created for user with ID: ${userId}`,
      );
      return token;
    } catch (error) {
      this.logger.error(
        `Failed to create password reset token for user with ID: ${userId}. Error: ${error.message}`,
      );
      throw new Error('Failed to create password reset token');
    }
  }

  async validatePasswordResetToken(token: string): Promise<number> {
    this.logger.log(`Validating password reset token: ${token}`);
    try {
      if (!token) {
        this.logger.warn('Token not provided for validation');
        throw new BadRequestException('Token must be provided');
      }

      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { token },
      });

      if (!resetToken) {
        this.logger.warn(`Invalid or expired reset token: ${token}`);
        throw new BadRequestException('Invalid or expired reset token');
      }

      this.logger.log(
        `Password reset token validated for user ID: ${resetToken.userId}`,
      );
      return resetToken.userId;
    } catch (error) {
      this.logger.error(
        `Failed to validate password reset token: ${token}. Error: ${error.message}`,
      );
      throw new Error('Failed to validate password reset token');
    }
  }

  async resetPassword(userId: number, newPassword: string): Promise<void> {
    this.logger.log(`Resetting password for user with ID: ${userId}`);
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      await this.prisma.passwordResetToken.deleteMany({
        where: { userId },
      });

      this.logger.log(
        `Password reset successfully for user with ID: ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to reset password for user with ID: ${userId}. Error: ${error.message}`,
      );
      throw new Error('Failed to reset password');
    }
  }
}
