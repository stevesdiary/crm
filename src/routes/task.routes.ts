import { Router } from 'express';
import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const taskService = new TaskService();

router.use(authenticateToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, priority, assignedTo } = req.query;
    const tenantId = req.user!.tenantId;
    
    const result = await taskService.findAll(
      tenantId,
      { status, priority, assignedTo },
      Number(page),
      Number(limit)
    );

    res.json({
      data: result.rows,
      total: result.count,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    
    const task = await taskService.findById(id, tenantId);
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const assignedBy = req.user!.sub;
    
    const task = await taskService.create(req.body, tenantId, assignedBy);
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    
    const updated = await taskService.update(id, req.body, tenantId);
    
    if (!updated) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    
    const deleted = await taskService.delete(id, tenantId);
    
    if (!deleted) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
