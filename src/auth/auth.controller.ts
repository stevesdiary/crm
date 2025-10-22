import { Controller, Post, Body, UnauthorizedException, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RateLimitGuard } from '../security/rate-limit.guard';
import { RateLimit } from '../security/rate-limit.decorator';
import { ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/reset-password.dto';
import { EnableTwoFactorDto, VerifyTwoFactorDto, LoginWithTwoFactorDto } from './dto/two-factor.dto';

@Controller('api/v1/auth')
@UseGuards(RateLimitGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: { email: string; password: string; fullName: string }) {
    return this.authService.signup(signupDto.email, signupDto.password, signupDto.fullName);
  }

  @Post('login')
  @RateLimit(5, 60000) // 5 attempts per minute
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user);
  }

  @Post('login/2fa')
  @RateLimit(3, 60000)
  async loginWith2FA(@Body() loginDto: LoginWithTwoFactorDto) {
    return this.authService.loginWith2FA(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: { refresh_token: string }) {
    return this.authService.refresh(refreshDto.refresh_token);
  }

  @Post('forgot')
  @RateLimit(3, 300000) // 3 attempts per 5 minutes
  async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotDto.email);
    return { message: 'Password reset email sent if account exists' };
  }

  @Post('reset')
  @RateLimit(5, 60000)
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetDto.token, resetDto.newPassword);
    return { message: 'Password reset successfully' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Body() changeDto: ChangePasswordDto, @Request() req: any) {
    await this.authService.changePassword(req.user.sub, changeDto.currentPassword, changeDto.newPassword);
    return { message: 'Password changed successfully' };
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  async enableTwoFactor(@Body() enableDto: EnableTwoFactorDto, @Request() req: any) {
    return this.authService.enableTwoFactor(req.user.sub, enableDto.secret, enableDto.token);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  async disableTwoFactor(@Request() req: any) {
    await this.authService.disableTwoFactor(req.user.sub);
    return { message: 'Two-factor authentication disabled' };
  }

  @Get('2fa/setup')
  @UseGuards(JwtAuthGuard)
  async setupTwoFactor(@Request() req: any) {
    return this.authService.generateTwoFactorSecret(req.user.sub);
  }

  @Post('verify-email')
  @RateLimit(3, 60000)
  async verifyEmail(@Body() body: { token: string }) {
    await this.authService.verifyEmail(body.token);
    return { message: 'Email verified successfully' };
  }
}