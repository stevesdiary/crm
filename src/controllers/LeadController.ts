import { Request, Response } from 'express';
import { LeadService } from '../services/LeadService';

export class LeadController {
  private leadService: LeadService;

  constructor() {
    this.leadService = new LeadService();
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const tenantId = req.user!.tenantId;
      
      const result = await this.leadService.findAll(
        tenantId,
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
      console.error('Get leads error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;
      
      const lead = await this.leadService.findById(id, tenantId);
      
      if (!lead) {
        res.status(404).json({ message: 'Lead not found' });
        return;
      }

      res.json(lead);
    } catch (error) {
      console.error('Get lead error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const ownerId = req.user!.sub;
      
      const lead = await this.leadService.create(req.body, tenantId, ownerId);
      
      res.status(201).json(lead);
    } catch (error) {
      console.error('Create lead error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;
      
      const updated = await this.leadService.update(id, req.body, tenantId);
      
      if (!updated) {
        res.status(404).json({ message: 'Lead not found' });
        return;
      }

      res.json({ message: 'Lead updated successfully' });
    } catch (error) {
      console.error('Update lead error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;
      
      const deleted = await this.leadService.delete(id, tenantId);
      
      if (!deleted) {
        res.status(404).json({ message: 'Lead not found' });
        return;
      }

      res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
      console.error('Delete lead error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
