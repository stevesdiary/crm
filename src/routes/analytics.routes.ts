import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const analyticsService = new AnalyticsService();

router.use(authenticateToken);

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = await analyticsService.getDashboard(tenantId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/sales', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    const data = await analyticsService.getSalesMetrics(tenantId, start, end);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/leads/conversion', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = await analyticsService.getLeadConversion(tenantId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/tickets/metrics', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = await analyticsService.getTicketMetrics(tenantId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
