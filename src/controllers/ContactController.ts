import { Request, Response } from 'express';
import { ContactService } from '../services/ContactService';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const tenantId = req.user!.tenantId;
      
      const result = await this.contactService.findAll(
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
      console.error('Get contacts error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;
      
      const contact = await this.contactService.findById(id, tenantId);
      
      if (!contact) {
        res.status(404).json({ message: 'Contact not found' });
        return;
      }

      res.json(contact);
    } catch (error) {
      console.error('Get contact error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const userId = req.user!.sub;
      
      const contact = await this.contactService.create(req.body, tenantId, userId);
      
      res.status(201).json(contact);
    } catch (error) {
      console.error('Create contact error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;
      
      const updated = await this.contactService.update(id, req.body, tenantId);
      
      if (!updated) {
        res.status(404).json({ message: 'Contact not found' });
        return;
      }

      res.json({ message: 'Contact updated successfully' });
    } catch (error) {
      console.error('Update contact error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;
      
      const deleted = await this.contactService.delete(id, tenantId);
      
      if (!deleted) {
        res.status(404).json({ message: 'Contact not found' });
        return;
      }

      res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
