import { Contact, Lead, Opportunity, Task, Ticket } from '../models';
import { Op } from 'sequelize';

export class AnalyticsService {
  async getDashboard(tenantId: string) {
    const [contacts, leads, opportunities, tasks, tickets] = await Promise.all([
      Contact.count({ where: { tenantId } }),
      Lead.count({ where: { tenantId } }),
      Opportunity.count({ where: { tenantId } }),
      Task.count({ where: { tenantId, status: { [Op.ne]: 'completed' } } }),
      Ticket.count({ where: { tenantId, status: { [Op.ne]: 'resolved' } } }),
    ]);

    const revenue = await Opportunity.sum('amount', {
      where: { tenantId, stage: 'closed_won' },
    });

    return {
      contacts,
      leads,
      opportunities,
      openTasks: tasks,
      openTickets: tickets,
      totalRevenue: revenue || 0,
    };
  }

  async getSalesMetrics(tenantId: string, startDate: Date, endDate: Date) {
    const opportunities = await Opportunity.findAll({
      where: {
        tenantId,
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      attributes: ['stage', 'amount'],
    });

    const byStage = opportunities.reduce((acc: any, opp: any) => {
      if (!acc[opp.stage]) acc[opp.stage] = { count: 0, total: 0 };
      acc[opp.stage].count += 1;
      acc[opp.stage].total += parseFloat(opp.amount);
      return acc;
    }, {});

    return byStage;
  }

  async getLeadConversion(tenantId: string) {
    const totalLeads = await Lead.count({ where: { tenantId } });
    const convertedLeads = await Lead.count({
      where: { tenantId, status: 'converted' },
    });

    return {
      total: totalLeads,
      converted: convertedLeads,
      rate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
    };
  }

  async getTicketMetrics(tenantId: string) {
    const [total, open, resolved, avgResponseTime] = await Promise.all([
      Ticket.count({ where: { tenantId } }),
      Ticket.count({ where: { tenantId, status: 'open' } }),
      Ticket.count({ where: { tenantId, status: 'resolved' } }),
      Ticket.findAll({
        where: { tenantId, responseTime: { [Op.ne]: null } },
        attributes: ['responseTime'],
      }),
    ]);

    const avgTime = avgResponseTime.length > 0
      ? avgResponseTime.reduce((sum: number, t: any) => sum + t.responseTime, 0) / avgResponseTime.length
      : 0;

    return { total, open, resolved, avgResponseTime: avgTime };
  }
}
