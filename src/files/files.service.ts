import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from './storage.service';
import * as crypto from 'crypto';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService
  ) {}

  async uploadFile(
    file: any,
    tenantId: string,
    uploadedBy: string,
    entityType?: string,
    entityId?: string
  ) {
    const storageKey = await this.storageService.uploadFile(file, tenantId);

    const document = await this.prisma.document.create({
      data: {
        tenantId,
        filename: storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageKey,
        entityType,
        entityId,
        uploadedBy,
      },
      include: {
        uploader: { select: { fullName: true } }
      }
    });

    return document;
  }

  async uploadNewVersion(
    file: any,
    parentId: string,
    tenantId: string,
    uploadedBy: string
  ) {
    const parent = await this.prisma.document.findFirst({
      where: { id: parentId, tenantId }
    });

    if (!parent) {
      throw new NotFoundException('Parent document not found');
    }

    const storageKey = await this.storageService.uploadFile(file, tenantId);
    const nextVersion = parent.version + 1;

    const document = await this.prisma.document.create({
      data: {
        tenantId,
        filename: storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageKey,
        version: nextVersion,
        parentId,
        entityType: parent.entityType,
        entityId: parent.entityId,
        uploadedBy,
      },
      include: {
        uploader: { select: { fullName: true } }
      }
    });

    return document;
  }

  async getDocuments(tenantId: string, filters?: {
    entityType?: string;
    entityId?: string;
    mimeType?: string;
  }) {
    return this.prisma.document.findMany({
      where: {
        tenantId,
        parentId: null, // Only get latest versions
        ...(filters?.entityType && { entityType: filters.entityType }),
        ...(filters?.entityId && { entityId: filters.entityId }),
        ...(filters?.mimeType && { mimeType: { contains: filters.mimeType } })
      },
      include: {
        uploader: { select: { fullName: true } },
        versions: {
          orderBy: { version: 'desc' },
          include: {
            uploader: { select: { fullName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDocument(id: string, tenantId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
      include: {
        uploader: { select: { fullName: true } },
        parent: true,
        versions: {
          orderBy: { version: 'desc' },
          include: {
            uploader: { select: { fullName: true } }
          }
        }
      }
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async downloadDocument(id: string, tenantId: string) {
    const document = await this.getDocument(id, tenantId);
    const fileBuffer = await this.storageService.downloadFile(document.storageKey);
    
    return {
      buffer: fileBuffer,
      filename: document.originalName,
      mimeType: document.mimeType
    };
  }

  async deleteDocument(id: string, tenantId: string) {
    const document = await this.getDocument(id, tenantId);
    
    // Delete all versions
    const allVersions = await this.prisma.document.findMany({
      where: {
        OR: [
          { id },
          { parentId: id }
        ],
        tenantId
      }
    });

    // Delete from storage
    for (const version of allVersions) {
      await this.storageService.deleteFile(version.storageKey);
    }

    // Delete from database
    await this.prisma.document.deleteMany({
      where: {
        OR: [
          { id },
          { parentId: id }
        ],
        tenantId
      }
    });

    return { message: 'Document deleted successfully' };
  }

  async getEntityDocuments(entityType: string, entityId: string, tenantId: string) {
    return this.getDocuments(tenantId, { entityType, entityId });
  }

  async getDocumentVersions(id: string, tenantId: string) {
    const document = await this.getDocument(id, tenantId);
    
    if (document.parentId) {
      return this.prisma.document.findMany({
        where: {
          OR: [
            { id: document.parentId },
            { parentId: document.parentId }
          ],
          tenantId
        },
        include: {
          uploader: { select: { fullName: true } }
        },
        orderBy: { version: 'desc' }
      });
    } else {
      return this.prisma.document.findMany({
        where: {
          OR: [
            { id },
            { parentId: id }
          ],
          tenantId
        },
        include: {
          uploader: { select: { fullName: true } }
        },
        orderBy: { version: 'desc' }
      });
    }
  }

  async createShareLink(
    documentId: string,
    tenantId: string,
    userId: string,
    expiresIn: number = 86400
  ) {
    const document = await this.getDocument(documentId, tenantId);
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const shareLink = await this.prisma.fileShare.create({
      data: {
        documentId,
        tenantId,
        token,
        expiresAt,
        createdBy: userId,
      },
    });

    return {
      ...shareLink,
      url: `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/files/share/${token}`,
    };
  }

  async getByShareToken(token: string) {
    const share = await this.prisma.fileShare.findUnique({
      where: { token },
      include: {
        document: {
          include: {
            uploader: { select: { fullName: true } },
          },
        },
      },
    });

    if (!share) {
      throw new NotFoundException('Share link not found');
    }

    if (share.expiresAt < new Date()) {
      throw new ForbiddenException('Share link has expired');
    }

    if (!share.isActive) {
      throw new ForbiddenException('Share link has been revoked');
    }

    await this.prisma.fileShare.update({
      where: { id: share.id },
      data: { accessCount: { increment: 1 } },
    });

    return share.document;
  }

  async revokeShareLink(shareId: string, tenantId: string) {
    const share = await this.prisma.fileShare.findFirst({
      where: { id: shareId, tenantId },
    });

    if (!share) {
      throw new NotFoundException('Share link not found');
    }

    await this.prisma.fileShare.update({
      where: { id: shareId },
      data: { isActive: false },
    });

    return { message: 'Share link revoked' };
  }

  async getDocumentShares(documentId: string, tenantId: string) {
    return this.prisma.fileShare.findMany({
      where: { documentId, tenantId },
      include: {
        creator: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}