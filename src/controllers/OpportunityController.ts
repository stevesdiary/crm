import { Request, Response } from 'express';
import { OpportunityService } from '../services/OpportunityService';

export class OpportunityController {
  private opportunityService: OpportunityService;

  constructor() {
    this.opportunityService = new OpportunityService();
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, stage, ownerId } = req.query;
      const tenantId = req.user!.tenantId;
      
      const result = await this.opportunityService.findAll(
        tenantId,
        { stage, ownerId },
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
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;
      
      const opportunity = await this.opportunityService.findById(id, tenantId);
      
      if (!opportunity) {
        res.status(404).json({ message: 'Opportunity not found' });
        return;
      }

      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const ownerId = req.user!.sub;
      
      const opportunity = await this.opportunityService.create(req.body, tenantId, ownerId);
      
      res.status(201).json(opportunity);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;
      
      const updated = await this.opportunityService.update(id, req.body, tenantId);
      
      if (!updated) {
        res.status(404).json({ message: 'Opportunity not found' });
        return;
      }

      res.json({ message: 'Opportunity updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;
      
      const deleted = await this.opportunityService.delete(id, tenantId);
      
      if (!deleted) {
        res.status(404).json({ message: 'Opportunity not found' });
        return;
      }

      res.json({ message: 'Opportunity deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getForecast(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const forecast = await this.opportunityService.getRevenueForecast(tenantId);
      res.json(forecast);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
