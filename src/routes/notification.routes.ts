import { Router, Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const notificationService = new NotificationService();

router.use(authenticateToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    const tenantId = req.user!.tenantId;
    const { unreadOnly } = req.query;
    
    const notifications = await notificationService.findByUser(
      userId,
      tenantId,
      unreadOnly === 'true'
    );
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.sub;
    const tenantId = req.user!.tenantId;
    
    const updated = await notificationService.markAsRead(id, userId, tenantId);
    
    if (!updated) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    const tenantId = req.user!.tenantId;
    
    await notificationService.markAllAsRead(userId, tenantId);
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.sub;
    const tenantId = req.user!.tenantId;
    
    const deleted = await notificationService.delete(id, userId, tenantId);
    
    if (!deleted) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
