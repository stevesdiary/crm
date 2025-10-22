import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: { 
        id: true, 
        email: true, 
        fullName: true, 
        role: { select: { id: true, name: true, description: true } }, 
        lastLogin: true,
        createdAt: true 
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: { 
        id: true, 
        email: true, 
        fullName: true, 
        role: { select: { id: true, name: true, description: true } }, 
        lastLogin: true, 
        prefs: true,
        createdAt: true 
      },
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async update(id: string, data: UpdateUserDto, tenantId: string) {
    const updateData: any = { ...data };
    
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }
    
    if (data.roleId) {
      // Verify role belongs to tenant
      const role = await this.prisma.role.findFirst({
        where: { id: data.roleId, tenantId }
      });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }
    
    const result = await this.prisma.user.updateMany({
      where: { id, tenantId },
      data: updateData,
    });
    
    if (result.count === 0) {
      throw new NotFoundException('User not found');
    }
    
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    const result = await this.prisma.user.deleteMany({
      where: { id, tenantId },
    });
    
    if (result.count === 0) {
      throw new NotFoundException('User not found');
    }
    
    return { message: 'User deleted successfully' };
  }

  async getAvailableRoles(tenantId: string) {
    return this.prisma.role.findMany({
      where: { tenantId },
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' }
    });
  }

  async create(data: CreateUserDto, tenantId: string) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
    
    // If roleId provided, verify it belongs to tenant
    if (data.roleId) {
      const role = await this.prisma.role.findFirst({
        where: { id: data.roleId, tenantId }
      });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }
    
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash,
        tenantId,
        roleId: data.roleId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: { select: { id: true, name: true, description: true } },
        createdAt: true
      }
    });
    
    return user;
  }
}