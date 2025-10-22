import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import { EncryptionService } from '../security/encryption.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { authenticator } from 'otplib';
import { LoginWithTwoFactorDto } from './dto/two-factor.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private permissionsService: PermissionsService,
    private encryptionService: EncryptionService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, tenantId: user.tenantId, roleId: user.roleId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.generateRefreshToken();
    
    // Store refresh token in Redis (implement Redis service)
    // await this.redis.set(`refresh:${user.id}`, refreshToken, 'EX', 604800); // 7 days
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async signup(email: string, password: string, fullName: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = randomBytes(32).toString('hex');
    
    // Seed permissions first
    await this.permissionsService.seedPermissions();
    
    // Create tenant
    const tenant = await this.prisma.tenant.create({
      data: { name: `${fullName}'s Organization`, plan: 'free' },
    });
    
    // Create default roles for tenant
    const { adminRole } = await this.permissionsService.createDefaultRoles(tenant.id);
    
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        tenantId: tenant.id,
        roleId: adminRole.id,
      },
    });
    
    // Send verification email (implement email service)
    // await this.emailService.sendVerification(email, verificationToken);
    
    return { user, tenant };
  }

  async refresh(refreshToken: string) {
    // Validate refresh token from Redis
    // const userId = await this.redis.get(`refresh_token:${refreshToken}`);
    // if (!userId) throw new UnauthorizedException();
    
    // Generate new tokens
    // const user = await this.prisma.user.findUnique({ where: { id: userId } });
    // return this.login(user);
  }

  private generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; // Don't reveal if email exists
    
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour
    
    // Store reset token in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        prefs: {
          ...user.prefs as any,
          resetToken,
          resetTokenExpiry: expiresAt.toISOString()
        }
      }
    });
    
    // Send reset email (implement email service)
    console.log(`Reset token for ${email}: ${resetToken}`);
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        prefs: {
          path: ['resetToken'],
          equals: token
        }
      }
    });
    
    if (!user || !user.prefs) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    
    const prefs = user.prefs as any;
    if (new Date() > new Date(prefs.resetTokenExpiry)) {
      throw new BadRequestException('Reset token has expired');
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        prefs: {
          ...prefs,
          resetToken: null,
          resetTokenExpiry: null
        }
      }
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !await bcrypt.compare(currentPassword, user.passwordHash)) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  }

  async generateTwoFactorSecret(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'CRM Platform', secret);
    
    return { secret, qrCodeUrl: otpauthUrl };
  }

  async enableTwoFactor(userId: string, secret: string, token: string) {
    const isValid = authenticator.verify({ token, secret });
    if (!isValid) {
      throw new BadRequestException('Invalid 2FA token');
    }
    
    const encryptedSecret = this.encryptionService.encrypt(secret);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        prefs: {
          twoFactorSecret: encryptedSecret,
          twoFactorEnabled: true
        }
      }
    });
    
    return { message: 'Two-factor authentication enabled' };
  }

  async disableTwoFactor(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        prefs: {
          twoFactorSecret: null,
          twoFactorEnabled: false
        }
      }
    });
  }

  async loginWith2FA(loginDto: LoginWithTwoFactorDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException();
    
    const fullUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    const prefs = fullUser?.prefs as any;
    
    if (!prefs?.twoFactorEnabled || !prefs?.twoFactorSecret) {
      throw new BadRequestException('2FA not enabled for this account');
    }
    
    const secret = this.encryptionService.decrypt(prefs.twoFactorSecret);
    const isValid = authenticator.verify({ token: loginDto.twoFactorToken, secret });
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }
    
    return this.login(user);
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        prefs: {
          path: ['emailVerificationToken'],
          equals: token
        }
      }
    });
    
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        prefs: {
          ...user.prefs as any,
          emailVerified: true,
          emailVerificationToken: null
        }
      }
    });
  }
}