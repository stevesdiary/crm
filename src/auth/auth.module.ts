import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PermissionsService } from '../permissions/permissions.service';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '24h' },
    }),
    SecurityModule,
  ],
  providers: [AuthService, JwtStrategy, PermissionsService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}