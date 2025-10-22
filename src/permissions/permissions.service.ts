import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async seedPermissions() {
    const permissions = [
      // Contacts
      { name: 'contacts:read', resource: 'contacts', action: 'read' },
      { name: 'contacts:create', resource: 'contacts', action: 'create' },
      { name: 'contacts:update', resource: 'contacts', action: 'update' },
      { name: 'contacts:delete', resource: 'contacts', action: 'delete' },
      
      // Leads
      { name: 'leads:read', resource: 'leads', action: 'read' },
      { name: 'leads:create', resource: 'leads', action: 'create' },
      { name: 'leads:update', resource: 'leads', action: 'update' },
      { name: 'leads:delete', resource: 'leads', action: 'delete' },
      { name: 'leads:import', resource: 'leads', action: 'import' },
      
      // Opportunities
      { name: 'opportunities:read', resource: 'opportunities', action: 'read' },
      { name: 'opportunities:create', resource: 'opportunities', action: 'create' },
      { name: 'opportunities:update', resource: 'opportunities', action: 'update' },
      { name: 'opportunities:delete', resource: 'opportunities', action: 'delete' },
      
      // Users
      { name: 'users:read', resource: 'users', action: 'read' },
      { name: 'users:create', resource: 'users', action: 'create' },
      { name: 'users:update', resource: 'users', action: 'update' },
      { name: 'users:delete', resource: 'users', action: 'delete' },
      
      // Reports
      { name: 'reports:read', resource: 'reports', action: 'read' },
      { name: 'reports:create', resource: 'reports', action: 'create' },
      
      // Tenant
      { name: 'tenant:update', resource: 'tenant', action: 'update' },
      
      // Workflows
      { name: 'workflows:read', resource: 'workflows', action: 'read' },
      { name: 'workflows:create', resource: 'workflows', action: 'create' },
      { name: 'workflows:update', resource: 'workflows', action: 'update' },
      { name: 'workflows:delete', resource: 'workflows', action: 'delete' },
    ];

    for (const permission of permissions) {
      await (this.prisma as any).permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission,
      });
    }
  }

  async createDefaultRoles(tenantId: string) {
    const adminRole = await this.prisma.role.create({
      data: {
        tenantId,
        name: 'admin',
        description: 'Full access to all resources',
        isSystem: true,
      },
    });

    const salesRole = await this.prisma.role.create({
      data: {
        tenantId,
        name: 'sales',
        description: 'Access to contacts, leads, and opportunities',
        isSystem: true,
      },
    });

    const supportRole = await this.prisma.role.create({
      data: {
        tenantId,
        name: 'support',
        description: 'Access to tickets and contacts',
        isSystem: true,
      },
    });

    // Assign all permissions to admin
    const allPermissions = await (this.prisma as any).permission.findMany();
    await (this.prisma as any).rolePermission.createMany({
      data: allPermissions.map((p: any) => ({
        roleId: adminRole.id,
        permissionId: p.id,
      })),
    });

    // Assign sales permissions
    const salesPermissions = await (this.prisma as any).permission.findMany({
      where: {
        resource: { in: ['contacts', 'leads', 'opportunities'] },
      },
    });
    await (this.prisma as any).rolePermission.createMany({
      data: salesPermissions.map((p: any) => ({
        roleId: salesRole.id,
        permissionId: p.id,
      })),
    });

    // Assign support permissions
    const supportPermissions = await (this.prisma as any).permission.findMany({
      where: {
        resource: { in: ['contacts', 'tickets'] },
      },
    });
    await (this.prisma as any).rolePermission.createMany({
      data: supportPermissions.map((p: any) => ({
        roleId: supportRole.id,
        permissionId: p.id,
      })),
    });

    return { adminRole, salesRole, supportRole };
  }
}