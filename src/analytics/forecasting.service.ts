import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

interface ForecastParams {
  periods?: number;
  method?: 'linear' | 'exponential' | 'moving_average';
}

@Injectable()
export class ForecastingService {
  constructor(private prisma: PrismaService) {}

  async forecastRevenue(tenantId: string, params: ForecastParams) {
    const historicalData = await this.getHistoricalRevenue(tenantId);
    const forecast = this.applyForecastMethod(historicalData, params);

    return {
      historical: historicalData,
      forecast,
      confidence: this.calculateConfidence(historicalData),
      method: params.method || 'linear'
    };
  }

  async forecastLeads(tenantId: string, params: ForecastParams) {
    const historicalData = await this.getHistoricalLeads(tenantId);
    const forecast = this.applyForecastMethod(historicalData, params);

    return {
      historical: historicalData,
      forecast,
      confidence: this.calculateConfidence(historicalData),
      method: params.method || 'linear'
    };
  }

  private async getHistoricalRevenue(tenantId: string) {
    const opportunities = await (this.prisma as any).opportunity.groupBy({
      by: ['createdAt'],
      where: { tenantId, stage: 'closed_won' },
      _sum: { amount: true },
      orderBy: { createdAt: 'asc' }
    });

    return this.aggregateByMonth(opportunities.map(o => ({
      date: o.createdAt,
      value: Number(o._sum.amount || 0)
    })));
  }

  private async getHistoricalLeads(tenantId: string) {
    const leads = await (this.prisma as any).lead.groupBy({
      by: ['createdAt'],
      where: { tenantId },
      _count: true,
      orderBy: { createdAt: 'asc' }
    });

    return this.aggregateByMonth(leads.map(l => ({
      date: l.createdAt,
      value: l._count
    })));
  }

  private aggregateByMonth(data: { date: Date; value: number }[]) {
    const monthly = data.reduce((acc: any, item) => {
      const month = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;
      acc[month] = (acc[month] || 0) + item.value;
      return acc;
    }, {});

    return Object.entries(monthly).map(([month, value]) => ({ month, value }));
  }

  private applyForecastMethod(data: any[], params: ForecastParams) {
    const periods = params.periods || 6;
    const method = params.method || 'linear';

    switch (method) {
      case 'linear':
        return this.linearRegression(data, periods);
      case 'exponential':
        return this.exponentialSmoothing(data, periods);
      case 'moving_average':
        return this.movingAverage(data, periods);
      default:
        return this.linearRegression(data, periods);
    }
  }

  private linearRegression(data: any[], periods: number) {
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.value);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return Array.from({ length: periods }, (_, i) => {
      const period = n + i;
      return {
        period: this.getNextMonth(data[n - 1].month, i + 1),
        value: Math.round(slope * period + intercept)
      };
    });
  }

  private exponentialSmoothing(data: any[], periods: number, alpha = 0.3) {
    let forecast = data[0].value;
    const forecasts = [];

    for (let i = 0; i < periods; i++) {
      forecast = alpha * (data[data.length - 1].value) + (1 - alpha) * forecast;
      forecasts.push({
        period: this.getNextMonth(data[data.length - 1].month, i + 1),
        value: Math.round(forecast)
      });
    }

    return forecasts;
  }

  private movingAverage(data: any[], periods: number, window = 3) {
    const lastValues = data.slice(-window).map(d => d.value);
    const avg = lastValues.reduce((a, b) => a + b, 0) / window;

    return Array.from({ length: periods }, (_, i) => ({
      period: this.getNextMonth(data[data.length - 1].month, i + 1),
      value: Math.round(avg)
    }));
  }

  private getNextMonth(currentMonth: string, offset: number) {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private calculateConfidence(data: any[]) {
    if (data.length < 3) return 0.5;
    
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    return Math.max(0, Math.min(1, 1 - cv));
  }
}
