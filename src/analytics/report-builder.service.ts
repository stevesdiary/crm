import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

interface ReportConfig {
  name: string;
  dataSource: string;
  columns: string[];
  filters?: Record<string, any>;
  groupBy?: string[];
  aggregations?: { field: string; function: string }[];
  sortBy?: { field: string; order: 'asc' | 'desc' }[];
  dateRange?: { start: string; end: string };
}

@Injectable()
export class ReportBuilderService {
  constructor(private prisma: PrismaService) {}

  async buildReport(tenantId: string, config: ReportConfig) {
    const query = this.buildQuery(tenantId, config);
    const data = await this.executeQuery(config.dataSource, query);
    
    return {
      name: config.name,
      data,
      metadata: {
        rowCount: data.length,
        columns: config.columns,
        generatedAt: new Date()
      }
    };
  }

  private buildQuery(tenantId: string, config: ReportConfig) {
    const where: any = { tenantId };

    if (config.filters) {
      Object.assign(where, config.filters);
    }

    if (config.dateRange) {
      where.createdAt = {
        gte: new Date(config.dateRange.start),
        lte: new Date(config.dateRange.end)
      };
    }

    const query: any = { where };

    if (config.columns.length) {
      query.select = config.columns.reduce((acc, col) => {
        acc[col] = true;
        return acc;
      }, {} as Record<string, boolean>);
    }

    if (config.sortBy?.length) {
      query.orderBy = config.sortBy.map(s => ({ [s.field]: s.order }));
    }

    return query;
  }

  private async executeQuery(dataSource: string, query: any) {
    const model = (this.prisma as any)[dataSource];
    if (!model) throw new Error(`Invalid data source: ${dataSource}`);

    return model.findMany(query);
  }

  async saveReport(tenantId: string, data: { name: string; config: ReportConfig }) {
    return (this.prisma as any).savedReport.create({
      data: {
        tenantId,
        name: data.name,
        config: data.config as any
      }
    });
  }

  async getSavedReports(tenantId: string) {
    return (this.prisma as any).savedReport.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async aggregateData(tenantId: string, config: ReportConfig) {
    if (!config.aggregations?.length) return [];

    const groupBy = config.groupBy || [];
    const data = await this.executeQuery(config.dataSource, this.buildQuery(tenantId, config));

    const grouped = data.reduce((acc: any, row: any) => {
      const key = groupBy.map(field => row[field]).join('|');
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});

    return Object.entries(grouped).map(([key, rows]: [string, any]) => {
      const result: any = {};
      groupBy.forEach((field, i) => {
        result[field] = key.split('|')[i];
      });

      config.aggregations!.forEach(agg => {
        const values = rows.map((r: any) => r[agg.field]).filter((v: any) => v != null);
        result[`${agg.function}_${agg.field}`] = this.applyAggregation(agg.function, values);
      });

      return result;
    });
  }

  private applyAggregation(func: string, values: number[]) {
    switch (func) {
      case 'sum': return values.reduce((a, b) => a + b, 0);
      case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min': return Math.min(...values);
      case 'max': return Math.max(...values);
      case 'count': return values.length;
      default: return null;
    }
  }
}
