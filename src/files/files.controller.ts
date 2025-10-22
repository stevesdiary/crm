import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  Query, 
  UseGuards, 
  Request, 
  UseInterceptors, 
  UploadedFile,
  Res,
  StreamableFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { FilesService } from './files.service';

@Controller('api/v1/files')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @Roles('admin', 'user', 'sales')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: any,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @TenantId() tenantId: string,
    @Request() req
  ) {
    return this.filesService.uploadFile(
      file,
      tenantId,
      req.user.userId,
      entityType,
      entityId
    );
  }

  @Post(':id/version')
  @Roles('admin', 'user', 'sales')
  @UseInterceptors(FileInterceptor('file'))
  uploadNewVersion(
    @UploadedFile() file: any,
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Request() req
  ) {
    return this.filesService.uploadNewVersion(
      file,
      id,
      tenantId,
      req.user.userId
    );
  }

  @Get()
  @Roles('admin', 'user', 'sales')
  getDocuments(
    @TenantId() tenantId: string,
    @Query() query: { entityType?: string; entityId?: string; mimeType?: string }
  ) {
    return this.filesService.getDocuments(tenantId, query);
  }

  @Get('entity/:entityType/:entityId')
  @Roles('admin', 'user', 'sales')
  getEntityDocuments(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @TenantId() tenantId: string
  ) {
    return this.filesService.getEntityDocuments(entityType, entityId, tenantId);
  }

  @Get(':id')
  @Roles('admin', 'user', 'sales')
  getDocument(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.filesService.getDocument(id, tenantId);
  }

  @Get(':id/versions')
  @Roles('admin', 'user', 'sales')
  getDocumentVersions(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.filesService.getDocumentVersions(id, tenantId);
  }

  @Get(':id/download')
  @Roles('admin', 'user', 'sales')
  async downloadDocument(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const { buffer, filename, mimeType } = await this.filesService.downloadDocument(id, tenantId);
    
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(buffer);
  }

  @Delete(':id')
  @Roles('admin', 'user')
  deleteDocument(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.filesService.deleteDocument(id, tenantId);
  }

  @Post(':id/share')
  @Roles('admin', 'user', 'sales')
  createShareLink(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Request() req,
    @Query('expiresIn') expiresIn?: number
  ) {
    return this.filesService.createShareLink(
      id,
      tenantId,
      req.user.userId,
      expiresIn ? parseInt(expiresIn.toString()) : 86400
    );
  }

  @Get(':id/shares')
  @Roles('admin', 'user', 'sales')
  getDocumentShares(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.filesService.getDocumentShares(id, tenantId);
  }

  @Delete('share/:shareId')
  @Roles('admin', 'user')
  revokeShareLink(@Param('shareId') shareId: string, @TenantId() tenantId: string) {
    return this.filesService.revokeShareLink(shareId, tenantId);
  }

  @Get('share/:token')
  async downloadSharedFile(
    @Param('token') token: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const document = await this.filesService.getByShareToken(token);
    const { buffer, filename, mimeType } = await this.filesService.downloadDocument(
      document.id,
      document.tenantId
    );
    
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(buffer);
  }
}