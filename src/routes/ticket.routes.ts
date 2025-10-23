import { Router } from 'express';
import { Request, Response } from 'express';
import { TicketService } from '../services/TicketService';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const ticketService = new TicketService();

router.use(authenticateToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, priority, assignedTo } = req.query;
    const tenantId = req.user!.tenantId;
    
    const result = await ticketService.findAll(
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
    
    const ticket = await ticketService.findById(id, tenantId);
    
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    
    const ticket = await ticketService.create(req.body, tenantId);
    
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    
    const updated = await ticketService.update(id, req.body, tenantId);
    
    if (!updated) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    
    const deleted = await ticketService.delete(id, tenantId);
    
    if (!deleted) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
