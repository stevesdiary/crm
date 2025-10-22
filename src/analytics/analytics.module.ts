import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { ReportBuilderService } from './report-builder.service';
import { VisualizationService } from './visualization.service';
import { ForecastingService } from './forecasting.service';
import { BenchmarkingService } from './benchmarking.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [
    ReportBuilderService,
    VisualizationService,
    ForecastingService,
    BenchmarkingService
  ],
  exports: [
    ReportBuilderService,
    VisualizationService,
    ForecastingService,
    BenchmarkingService
  ]
})
export class AnalyticsModule {}
