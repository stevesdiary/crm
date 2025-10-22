import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportBuilderService } from './report-builder.service';
import { VisualizationService } from './visualization.service';
import { ForecastingService } from './forecasting.service';
import { BenchmarkingService } from './benchmarking.service';

@Controller('api/v1/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private reportBuilder: ReportBuilderService,
    private visualization: VisualizationService,
    private forecasting: ForecastingService,
    private benchmarking: BenchmarkingService
  ) {}

  @Post('reports/build')
  async buildReport(@Body() config: any, @Req() req: any) {
    return this.reportBuilder.buildReport(req.user.tenantId, config);
  }

  @Get('reports/saved')
  async getSavedReports(@Req() req: any) {
    return this.reportBuilder.getSavedReports(req.user.tenantId);
  }

  @Post('reports/save')
  async saveReport(@Body() data: any, @Req() req: any) {
    return this.reportBuilder.saveReport(req.user.tenantId, data);
  }

  @Get('charts/:type')
  async getChart(@Query() params: any, @Req() req: any) {
    return this.visualization.generateChart(req.user.tenantId, params);
  }

  @Post('forecast/revenue')
  async forecastRevenue(@Body() params: any, @Req() req: any) {
    return this.forecasting.forecastRevenue(req.user.tenantId, params);
  }

  @Post('forecast/leads')
  async forecastLeads(@Body() params: any, @Req() req: any) {
    return this.forecasting.forecastLeads(req.user.tenantId, params);
  }

  @Get('benchmark/sales')
  async benchmarkSales(@Query() params: any, @Req() req: any) {
    return this.benchmarking.benchmarkSales(req.user.tenantId, params);
  }

  @Get('benchmark/team')
  async benchmarkTeam(@Req() req: any) {
    return this.benchmarking.benchmarkTeam(req.user.tenantId);
  }
}
