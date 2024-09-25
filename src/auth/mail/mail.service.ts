import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
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

    const info = await this.transporter.sendMail(message);
    console.log(
      'Password reset email sent:',
      nodemailer.getTestMessageUrl(info),
    );
  }
}
