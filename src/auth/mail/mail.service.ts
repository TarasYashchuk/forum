import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly logger: WinstonLoggerService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'gino.becker@ethereal.email',
        pass: 'DUnBxgz985ZEsbaHkN',
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`;

    const message = {
      from: 'no-reply@yourapp.com',
      to,
      subject: 'Password Reset',
      text: `You requested a password reset. Click this link to reset your password: ${resetUrl}`,
      html: `<p>You requested a password reset. Click this <a href="${resetUrl}">link</a> to reset your password.</p>`,
    };

    try {
      const info = await this.transporter.sendMail(message);
      this.logger.log(`Password reset email sent successfully to ${to}}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${to}: ${error.message}`,
      );
      throw new Error('Failed to send password reset email');
    }
  }
}
