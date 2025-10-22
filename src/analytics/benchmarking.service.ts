import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class BenchmarkingService {
  constructor(private prisma: PrismaService) {}

  async benchmarkSales(tenantId: string, params: any) {
    const period = params.period || 'month';
    const [current, previous, industry] = await Promise.all([
      this.getCurrentPeriodMetrics(tenantId, period),
      this.getPreviousPeriodMetrics(tenantId, period),
      this.getIndustryBenchmarks(period)
    ]);

    return {
      current,
      previous,
      industry,
      comparison: {
        vsLastPeriod: this.calculateChange(current, previous),
        vsIndustry: this.calculateChange(current, industry)
      },
      performance: this.calculatePerformanceScore(current, industry)
    };
  }

  async benchmarkTeam(tenantId: string) {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      select: { id: true, fullName: true, email: true }
    });

    const metrics = await Promise.all(
      users.map(user => this.getUserMetrics(tenantId, user.id))
    );

    const teamAverage = this.calculateTeamAverage(metrics);

    return users.map((user, i) => ({
      user,
      metrics: metrics[i],
      vsTeamAverage: this.calculateChange(metrics[i], teamAverage),
      rank: 0
    })).sort((a, b) => b.metrics.totalRevenue - a.metrics.totalRevenue)
      .map((item, i) => ({ ...item, rank: i + 1 }));
  }

  private async getCurrentPeriodMetrics(tenantId: string, period: string) {
    const { start, end } = this.getPeriodRange(period, 0);
    return this.getMetricsForRange(tenantId, start, end);
  }

  private async getPreviousPeriodMetrics(tenantId: string, period: string) {
    const { start, end } = this.getPeriodRange(period, -1);
    return this.getMetricsForRange(tenantId, start, end);
  }

  private async getMetricsForRange(tenantId: string, start: Date, end: Date) {
    const [opportunities, leads, tasks] = await Promise.all([
      (this.prisma as any).opportunity.findMany({
        where: { tenantId, createdAt: { gte: start, lte: end } }
      }),
      (this.prisma as any).lead.findMany({
        where: { tenantId, createdAt: { gte: start, lte: end } }
      }),
      (this.prisma as any).task.findMany({
        where: { tenantId, createdAt: { gte: start, lte: end } }
      })
    ]);

    const wonOpportunities = opportunities.filter(o => o.stage === 'closed_won');

    return {
      totalRevenue: wonOpportunities.reduce((sum, o) => sum + Number(o.amount || 0), 0),
      dealsWon: wonOpportunities.length,
      dealsTotal: opportunities.length,
      winRate: opportunities.length ? wonOpportunities.length / opportunities.length : 0,
      leadsGenerated: leads.length,
      leadsConverted: leads.filter(l => l.status === 'converted').length,
      conversionRate: leads.length ? leads.filter(l => l.status === 'converted').length / leads.length : 0,
      tasksCompleted: tasks.filter(t => t.status === 'completed').length,
      tasksTotal: tasks.length
    };
  }

  private async getUserMetrics(tenantId: string, userId: string) {
    const [opportunities, leads, tasks] = await Promise.all([
      (this.prisma as any).opportunity.findMany({
        where: { tenantId, ownerId: userId }
      }),
      (this.prisma as any).lead.findMany({
        where: { tenantId, ownerId: userId }
      }),
      (this.prisma as any).task.findMany({
        where: { tenantId, assignedTo: userId }
      })
    ]);

    const wonOpportunities = opportunities.filter(o => o.stage === 'closed_won');

    return {
      totalRevenue: wonOpportunities.reduce((sum, o) => sum + Number(o.amount || 0), 0),
      dealsWon: wonOpportunities.length,
      winRate: opportunities.length ? wonOpportunities.length / opportunities.length : 0,
      leadsConverted: leads.filter(l => l.status === 'converted').length,
      tasksCompleted: tasks.filter(t => t.status === 'completed').length
    };
  }

  private getPeriodRange(period: string, offset: number) {
    const now = new Date();
    let start: Date, end: Date;

    switch (period) {
      case 'week':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + (offset * 7));
        end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3) + offset;
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    }

    return { start, end };
  }

  private getIndustryBenchmarks(period: string) {
    return {
      totalRevenue: 50000,
      winRate: 0.25,
      conversionRate: 0.15,
      dealsWon: 10,
      leadsGenerated: 100
    };
  }

  private calculateChange(current: any, previous: any) {
    return {
      revenue: this.percentChange(current.totalRevenue, previous.totalRevenue),
      winRate: this.percentChange(current.winRate, previous.winRate),
      conversionRate: this.percentChange(current.conversionRate, previous.conversionRate)
    };
  }

  private percentChange(current: number, previous: number) {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  }

  private calculateTeamAverage(metrics: any[]) {
    const sum = metrics.reduce((acc, m) => ({
      totalRevenue: acc.totalRevenue + m.totalRevenue,
      dealsWon: acc.dealsWon + m.dealsWon,
      winRate: acc.winRate + m.winRate,
      leadsConverted: acc.leadsConverted + m.leadsConverted,
      tasksCompleted: acc.tasksCompleted + m.tasksCompleted
    }), { totalRevenue: 0, dealsWon: 0, winRate: 0, leadsConverted: 0, tasksCompleted: 0 });

    const count = metrics.length || 1;
    return {
      totalRevenue: sum.totalRevenue / count,
      dealsWon: sum.dealsWon / count,
      winRate: sum.winRate / count,
      leadsConverted: sum.leadsConverted / count,
      tasksCompleted: sum.tasksCompleted / count
    };
  }

  private calculatePerformanceScore(current: any, industry: any) {
    const revenueScore = Math.min(100, (current.totalRevenue / industry.totalRevenue) * 100);
    const winRateScore = Math.min(100, (current.winRate / industry.winRate) * 100);
    const conversionScore = Math.min(100, (current.conversionRate / industry.conversionRate) * 100);

    return Math.round((revenueScore + winRateScore + conversionScore) / 3);
  }
}
