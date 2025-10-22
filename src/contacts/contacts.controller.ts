import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ContactsService } from './contacts.service';
import { ContactsImportService } from './contacts-import.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('api/v1/contacts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ContactsController {
  constructor(
    private contactsService: ContactsService,
    private contactsImportService: ContactsImportService,
  ) {}

  @Post()
  @RequirePermissions('contacts:create')
  create(@Body() createContactDto: CreateContactDto, @Request() req: any) {
    return this.contactsService.create(createContactDto, req.user.tenantId, req.user.sub);
  }

  @Get()
  @RequirePermissions('contacts:read')
  findAll(@Request() req: any, @Query() query: any) {
    return this.contactsService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  @RequirePermissions('contacts:read')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.contactsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @RequirePermissions('contacts:update')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto, @Request() req: any) {
    return this.contactsService.update(id, updateContactDto, req.user.tenantId);
  }

  @Delete(':id')
  @RequirePermissions('contacts:delete')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.contactsService.remove(id, req.user.tenantId);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: any, @Request() req: any) {
    return this.contactsImportService.importCsv(file, req.user.tenantId, req.user.userId);
  }

  @Get('export')
  async exportCsv(@Request() req: any, @Res() res: Response) {
    const csvContent = await this.contactsImportService.exportCsv(req.user.tenantId);
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csvContent);
  }
}