import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/users/users.service';

@Injectable()
export class PasswordResetService {
  constructor(private readonly prisma: PrismaService) {}

  async createPasswordResetToken(userId: number): Promise<string> {
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

    return token;
  }

  async validatePasswordResetToken(token: string): Promise<number> {
    if (!token) {
      throw new BadRequestException('Token must be provided');
    }

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: {
        token: token,
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    return resetToken.userId;
  }

  async resetPassword(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
  }
}
