import { Contact } from '../models';
import { Op } from 'sequelize';
import { randomBytes } from 'crypto';

export class ContactService {
  async findAll(tenantId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return await Contact.findAndCountAll({
      where: { tenantId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id: string, tenantId: string) {
    return await Contact.findOne({ where: { id, tenantId } });
  }

  async create(data: any, tenantId: string, userId: string) {
    return await Contact.create({
      id: randomBytes(16).toString('hex'),
      ...data,
      tenantId,
      createdBy: userId,
    });
  }

  async update(id: string, data: any, tenantId: string) {
    const [updated] = await Contact.update(data, {
      where: { id, tenantId },
    });
    return updated > 0;
  }

  async delete(id: string, tenantId: string) {
    return await Contact.destroy({ where: { id, tenantId } });
  }

  async search(tenantId: string, query: string) {
    return await Contact.findAll({
      where: {
        tenantId,
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${query}%` } },
          { lastName: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { company: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });
  }
}
