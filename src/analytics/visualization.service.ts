import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

interface ChartConfig {
  type: string;
  dataSource: string;
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  dateRange?: { start: string; end: string };
}

@Injectable()
export class VisualizationService {
  constructor(private prisma: PrismaService) {}

  async generateChart(tenantId: string, config: ChartConfig) {
    const chartType = config.type;
    
    switch (chartType) {
      case 'line':
        return this.generateLineChart(tenantId, config);
      case 'bar':
        return this.generateBarChart(tenantId, config);
      case 'pie':
        return this.generatePieChart(tenantId, config);
      case 'funnel':
        return this.generateFunnelChart(tenantId, config);
      default:
        throw new Error(`Unsupported chart type: ${chartType}`);
    }
  }

  private async generateLineChart(tenantId: string, config: ChartConfig) {
    const data = await this.fetchChartData(tenantId, config);
    
    return {
      type: 'line',
      data: {
        labels: data.map(d => d[config.xAxis]),
        datasets: [{
          label: config.yAxis,
          data: data.map(d => d[config.yAxis])
        }]
      }
    };
  }

  private async generateBarChart(tenantId: string, config: ChartConfig) {
    const data = await this.fetchChartData(tenantId, config);
    
    if (config.groupBy) {
      const grouped = this.groupData(data, config.groupBy);
      return {
        type: 'bar',
        data: {
          labels: data.map(d => d[config.xAxis]),
          datasets: Object.entries(grouped).map(([key, values]: [string, any]) => ({
            label: key,
            data: values.map((v: any) => v[config.yAxis])
          }))
        }
      };
    }

    return {
      type: 'bar',
      data: {
        labels: data.map(d => d[config.xAxis]),
        datasets: [{
          label: config.yAxis,
          data: data.map(d => d[config.yAxis])
        }]
      }
    };
  }

  private async generatePieChart(tenantId: string, config: ChartConfig) {
    const data = await this.fetchChartData(tenantId, config);
    
    const aggregated = data.reduce((acc: any, item: any) => {
      const key = item[config.xAxis];
      acc[key] = (acc[key] || 0) + (item[config.yAxis] || 1);
      return acc;
    }, {});

    return {
      type: 'pie',
      data: {
        labels: Object.keys(aggregated),
        datasets: [{
          data: Object.values(aggregated)
        }]
      }
    };
  }

  private async generateFunnelChart(tenantId: string, config: ChartConfig) {
    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won'];
    const counts = await Promise.all(
      stages.map(stage =>
        (this.prisma as any)[config.dataSource].count({
          where: { tenantId, status: stage }
        })
      )
    );

    return {
      type: 'funnel',
      data: {
        labels: stages,
        datasets: [{
          data: counts
        }]
      }
    };
  }

  private async fetchChartData(tenantId: string, config: ChartConfig) {
    const where: any = { tenantId };

    if (config.dateRange) {
      where.createdAt = {
        gte: new Date(config.dateRange.start),
        lte: new Date(config.dateRange.end)
      };
    }

    return (this.prisma as any)[config.dataSource].findMany({
      where,
      select: {
        [config.xAxis]: true,
        [config.yAxis]: true,
        ...(config.groupBy ? { [config.groupBy]: true } : {})
      }
    });
  }

  private groupData(data: any[], groupBy: string) {
    return data.reduce((acc, item) => {
      const key = item[groupBy];
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }
}
