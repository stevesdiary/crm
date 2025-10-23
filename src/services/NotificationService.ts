import { Notification } from '../models';
import { randomBytes } from 'crypto';

export class NotificationService {
  async create(userId: string, tenantId: string, data: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    return await Notification.create({
      id: randomBytes(16).toString('hex'),
      userId,
      tenantId,
      ...data,
      data: data.data ? JSON.stringify(data.data) : null,
    });
  }

  async findByUser(userId: string, tenantId: string, unreadOnly = false) {
    const where: any = { userId, tenantId };
    if (unreadOnly) where.read = false;

    return await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
  }

  async markAsRead(id: string, userId: string, tenantId: string) {
    const [updated] = await Notification.update(
      { read: true },
      { where: { id, userId, tenantId } }
    );
    return updated > 0;
  }

  async markAllAsRead(userId: string, tenantId: string) {
    await Notification.update(
      { read: true },
      { where: { userId, tenantId, read: false } }
    );
  }

  async delete(id: string, userId: string, tenantId: string) {
    return await Notification.destroy({ where: { id, userId, tenantId } });
  }
}
