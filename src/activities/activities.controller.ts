import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivitiesService } from './activities.service';

@Controller('api/v1/activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Post()
  create(@Body() createActivityDto: any, @Request() req: any) {
    return this.activitiesService.create(
      createActivityDto,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Get()
  findAll(@Request() req: any, @Query('relatedEntityId') relatedEntityId?: string) {
    return this.activitiesService.findAll(req.user.tenantId, relatedEntityId);
  }
}