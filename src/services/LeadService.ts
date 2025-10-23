import { Lead, Contact } from '../models';
import { randomBytes } from 'crypto';

export class LeadService {
  async findAll(tenantId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return await Lead.findAndCountAll({
      where: { tenantId },
      include: [{ model: Contact, as: 'contact' }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id: string, tenantId: string) {
    return await Lead.findOne({
      where: { id, tenantId },
      include: [{ model: Contact, as: 'contact' }],
    });
  }

  async create(data: any, tenantId: string, ownerId: string) {
    return await Lead.create({
      id: randomBytes(16).toString('hex'),
      ...data,
      tenantId,
      ownerId,
    });
  }

  async update(id: string, data: any, tenantId: string) {
    const [updated] = await Lead.update(data, {
      where: { id, tenantId },
    });
    return updated > 0;
  }

  async delete(id: string, tenantId: string) {
    return await Lead.destroy({ where: { id, tenantId } });
  }

  async updateStatus(id: string, status: string, tenantId: string) {
    return await this.update(id, { status }, tenantId);
  }

  async updateScore(id: string, score: number, tenantId: string) {
    return await this.update(id, { score }, tenantId);
  }
}
