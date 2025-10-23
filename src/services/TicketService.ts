import { Ticket, Contact, User } from '../models';
import { randomBytes } from 'crypto';

export class TicketService {
  async findAll(tenantId: string, filters: any = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const where: any = { tenantId };
    
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;

    return await Ticket.findAndCountAll({
      where,
      include: [
        { model: Contact, as: 'contact' },
        { model: User, as: 'assignee' },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id: string, tenantId: string) {
    return await Ticket.findOne({
      where: { id, tenantId },
      include: [
        { model: Contact, as: 'contact' },
        { model: User, as: 'assignee' },
      ],
    });
  }

  async create(data: any, tenantId: string) {
    return await Ticket.create({
      id: randomBytes(16).toString('hex'),
      ...data,
      tenantId,
    });
  }

  async update(id: string, data: any, tenantId: string) {
    const [updated] = await Ticket.update(data, {
      where: { id, tenantId },
    });
    return updated > 0;
  }

  async delete(id: string, tenantId: string) {
    return await Ticket.destroy({ where: { id, tenantId } });
  }

  async updateStatus(id: string, status: string, tenantId: string) {
    const updateData: any = { status };
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }
    return await this.update(id, updateData, tenantId);
  }

  async assignTicket(id: string, assignedTo: string, tenantId: string) {
    return await this.update(id, { assignedTo }, tenantId);
  }
}
