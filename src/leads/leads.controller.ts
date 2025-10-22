import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';

@Controller('api/v1/leads')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  @RequirePermissions('leads:create')
  create(@Body() createLeadDto: CreateLeadDto, @Request() req: any) {
    return this.leadsService.create(createLeadDto, req.user.tenantId, req.user.sub);
  }

  @Get()
  @RequirePermissions('leads:read')
  findAll(@Request() req: any, @Query() query: any) {
    return this.leadsService.findAll(req.user.tenantId, query);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: any, @Request() req: any) {
    return this.leadsService.importCsv(file, req.user.tenantId, req.user.userId);
  }

  @Get('sources')
  @RequirePermissions('leads:read')
  getLeadSources(@Request() req: any) {
    return this.leadsService.getLeadSources(req.user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('leads:read')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.leadsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @RequirePermissions('leads:update')
  update(@Param('id') id: string, @Body() updateLeadDto: any, @Request() req: any) {
    return this.leadsService.update(id, updateLeadDto, req.user.tenantId);
  }

  @Post(':id/convert')
  @RequirePermissions('leads:update')
  convertToOpportunity(@Param('id') id: string, @Body() convertDto: ConvertLeadDto, @Request() req: any) {
    return this.leadsService.convertToOpportunity(id, convertDto, req.user.tenantId, req.user.sub);
  }

  @Post(':id/score')
  @RequirePermissions('leads:update')
  updateScore(@Param('id') id: string, @Body() body: { score: number }, @Request() req: any) {
    return this.leadsService.updateScore(id, body.score, req.user.tenantId);
  }

  @Delete(':id')
  @RequirePermissions('leads:delete')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.leadsService.remove(id, req.user.tenantId);
  }
}