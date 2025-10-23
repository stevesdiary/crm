import { Opportunity, Contact, User, Quote } from '../models';
import { Op } from 'sequelize';
import { randomBytes } from 'crypto';

export class OpportunityService {
  async findAll(tenantId: string, filters: any = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const where: any = { tenantId };
    
    if (filters.stage) where.stage = filters.stage;
    if (filters.ownerId) where.ownerId = filters.ownerId;

    return await Opportunity.findAndCountAll({
      where,
      include: [
        { model: Contact, as: 'contact' },
        { model: User, as: 'owner' },
        { model: Quote, as: 'quotes' },
      ],
      limit,
      offset,
      order: [['expectedCloseDate', 'ASC']],
    });
  }

  async findById(id: string, tenantId: string) {
    return await Opportunity.findOne({
      where: { id, tenantId },
      include: [
        { model: Contact, as: 'contact' },
        { model: User, as: 'owner' },
        { model: Quote, as: 'quotes' },
      ],
    });
  }

  async create(data: any, tenantId: string, ownerId: string) {
    return await Opportunity.create({
      id: randomBytes(16).toString('hex'),
      ...data,
      tenantId,
      ownerId,
    });
  }

  async update(id: string, data: any, tenantId: string) {
    const [updated] = await Opportunity.update(data, {
      where: { id, tenantId },
    });
    return updated > 0;
  }

  async delete(id: string, tenantId: string) {
    return await Opportunity.destroy({ where: { id, tenantId } });
  }

  async updateStage(id: string, stage: string, tenantId: string) {
    return await this.update(id, { stage }, tenantId);
  }

  async getRevenueForecast(tenantId: string) {
    const opportunities = await Opportunity.findAll({
      where: { tenantId, stage: { [Op.ne]: 'closed_lost' } },
      attributes: ['stage', 'amount', 'currency'],
    });

    return opportunities.reduce((acc: any, opp: any) => {
      const stage = opp.stage;
      if (!acc[stage]) acc[stage] = { total: 0, count: 0 };
      acc[stage].total += parseFloat(opp.amount);
      acc[stage].count += 1;
      return acc;
    }, {});
  }
}
