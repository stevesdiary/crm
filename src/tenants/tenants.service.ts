import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  async register(dto: RegisterTenantDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail }
    });
    
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

    // Seed permissions first
    await this.permissionsService.seedPermissions();

    // Create tenant and admin user in transaction
    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.tenantName,
          plan: dto.plan || 'free',
          domain: dto.domain,
        },
      });

      // Create default roles for tenant
      const { adminRole } = await this.permissionsService.createDefaultRoles(tenant.id);

      const user = await tx.user.create({
        data: {
          email: dto.adminEmail,
          passwordHash,
          fullName: dto.adminFullName,
          tenantId: tenant.id,
          roleId: adminRole.id,
        },
      });

      return { tenant, user: { id: user.id, email: user.email, fullName: user.fullName } };
    });
  }

  async create(data: any) {
    return this.prisma.tenant.create({
      data,
    });
  }

  async findOne(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }
}