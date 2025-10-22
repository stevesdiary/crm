import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesPipeline(tenantId: string) {
    const opportunities = await (this.prisma as any).opportunity.groupBy({
      by: ['stage'],
      where: { tenantId },
      _sum: { amount: true },
      _count: true,
    });

    return opportunities.map((stage: any) => ({
      stage: stage.stage,
      count: stage._count,
      totalValue: stage._sum.amount,
    }));
  }

  async getCustomReport(tenantId: string, reportId: string) {
    // Fetch saved report configuration and execute
    return { message: 'Custom reports to be implemented' };
  }
}