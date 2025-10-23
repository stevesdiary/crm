import { Task, User } from '../models';
import { randomBytes } from 'crypto';

export class TaskService {
  async findAll(tenantId: string, filters: any = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const where: any = { tenantId };
    
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;

    return await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignee' },
        { model: User, as: 'assigner' },
      ],
      limit,
      offset,
      order: [['dueAt', 'ASC']],
    });
  }

  async findById(id: string, tenantId: string) {
    return await Task.findOne({
      where: { id, tenantId },
      include: [
        { model: User, as: 'assignee' },
        { model: User, as: 'assigner' },
      ],
    });
  }

  async create(data: any, tenantId: string, assignedBy: string) {
    return await Task.create({
      id: randomBytes(16).toString('hex'),
      ...data,
      tenantId,
      assignedBy,
    });
  }

  async update(id: string, data: any, tenantId: string) {
    const [updated] = await Task.update(data, {
      where: { id, tenantId },
    });
    return updated > 0;
  }

  async delete(id: string, tenantId: string) {
    return await Task.destroy({ where: { id, tenantId } });
  }

  async updateStatus(id: string, status: string, tenantId: string) {
    return await this.update(id, { status }, tenantId);
  }
}
