import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PasswordResetService } from './password-reset.service';
import { Roles } from './roles.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { MailService } from './mail/mail.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailService: MailService,
    private passwordResetService: PasswordResetService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2)
  @Post('request-password-reset')
  async requestPasswordReset(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    const user = await this.authService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    const token = await this.passwordResetService.createPasswordResetToken(
      user.id,
    );
    await this.mailService.sendPasswordResetEmail(user.email, token);

    return { message: 'Password reset email sent' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2)
  @Patch('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    const userId =
      await this.passwordResetService.validatePasswordResetToken(token);
    await this.passwordResetService.resetPassword(userId, newPassword);

    return { message: 'Password successfully reset' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return {
      message: 'User information from Google',
      user: req.user.user,
      token: req.user.token,
    };
  }
}
