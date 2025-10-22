import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSalesKPIs(tenantId: string) {
    const [totalRevenue, totalOpportunities, wonOpportunities, activities] = await Promise.all([
      (this.prisma as any).opportunity.aggregate({
        where: { tenantId, stage: 'won' },
        _sum: { amount: true }
      }),
      (this.prisma as any).opportunity.count({ where: { tenantId } }),
      (this.prisma as any).opportunity.count({ where: { tenantId, stage: 'won' } }),
      (this.prisma as any).activity.count({ where: { tenantId } })
    ]);

    const winRate = totalOpportunities > 0 ? (wonOpportunities / totalOpportunities) * 100 : 0;

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalOpportunities,
      wonOpportunities,
      winRate: Math.round(winRate * 100) / 100,
      totalActivities: activities
    };
  }

  async getRevenueChart(tenantId: string, period: string = '6months') {
    const months = period === '12months' ? 12 : 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const opportunities = await (this.prisma as any).opportunity.findMany({
      where: {
        tenantId,
        stage: 'won',
        createdAt: { gte: startDate }
      },
      select: { amount: true, createdAt: true }
    });

    const monthlyRevenue = Array.from({ length: months }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      const monthKey = date.toISOString().slice(0, 7);
      
      const revenue = opportunities
        .filter(opp => opp.createdAt.toISOString().slice(0, 7) === monthKey)
        .reduce((sum, opp) => sum + Number(opp.amount), 0);

      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue
      };
    });

    return monthlyRevenue;
  }

  async getRevenueForecast(tenantId: string) {
    const pipeline = await (this.prisma as any).opportunity.findMany({
      where: {
        tenantId,
        stage: { not: 'won' }
      },
      select: { amount: true, stage: true }
    });

    const stageWeights = {
      'prospecting': 0.1,
      'qualification': 0.25,
      'proposal': 0.5,
      'negotiation': 0.75,
      'closed_lost': 0
    };

    const forecast = pipeline.reduce((sum, opp) => {
      const weight = stageWeights[opp.stage] || 0.1;
      return sum + (Number(opp.amount) * weight);
    }, 0);

    return {
      pipelineValue: pipeline.reduce((sum, opp) => sum + Number(opp.amount), 0),
      forecastedRevenue: Math.round(forecast),
      opportunitiesInPipeline: pipeline.length
    };
  }

  async getActivityMetrics(tenantId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentActivities, taskStats, ticketStats] = await Promise.all([
      (this.prisma as any).activity.findMany({
        where: {
          tenantId,
          createdAt: { gte: thirtyDaysAgo }
        },
        select: { type: true, createdAt: true }
      }),
      (this.prisma as any).task.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true
      }),
      (this.prisma as any).ticket.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true
      })
    ]);

    const activityByType = recentActivities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    return {
      recentActivities: recentActivities.length,
      activityByType,
      taskStats: taskStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {}),
      ticketStats: ticketStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {})
    };
  }

  async getLeadConversion(tenantId: string) {
    const [totalLeads, qualifiedLeads, convertedLeads] = await Promise.all([
      (this.prisma as any).lead.count({ where: { tenantId } }),
      (this.prisma as any).lead.count({ where: { tenantId, status: 'qualified' } }),
      (this.prisma as any).opportunity.count({
        where: {
          tenantId,
          contact: { leads: { some: {} } }
        }
      })
    ]);

    return {
      totalLeads,
      qualifiedLeads,
      convertedLeads,
      qualificationRate: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
      conversionRate: qualifiedLeads > 0 ? (convertedLeads / qualifiedLeads) * 100 : 0
    };
  }
}