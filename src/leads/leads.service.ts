import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private workflowEngine: WorkflowEngineService,
  ) {}

  async create(data: CreateLeadDto, tenantId: string, ownerId: string) {
    // Calculate initial score if not provided
    const score = data.score ?? this.calculateLeadScore(data);
    
    const lead = await (this.prisma as any).lead.create({
      data: { 
        ...data, 
        tenantId, 
        ownerId, 
        score 
      },
      include: { contact: true, owner: { select: { id: true, fullName: true } } }
    });

    // Trigger workflows
    await this.workflowEngine.triggerWorkflows('lead_created', 'lead', lead, tenantId);

    return lead;
  }

  async findAll(tenantId: string, query: any = {}) {
    const { source, status, minScore, maxScore, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    
    const where: any = { tenantId };
    if (source) where.source = source;
    if (status) where.status = status;
    if (minScore !== undefined || maxScore !== undefined) {
      where.score = {};
      if (minScore !== undefined) where.score.gte = parseInt(minScore);
      if (maxScore !== undefined) where.score.lte = parseInt(maxScore);
    }
    
    const [leads, total] = await Promise.all([
      (this.prisma as any).lead.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { 
          contact: { select: { id: true, firstName: true, lastName: true, email: true } },
          owner: { select: { id: true, fullName: true } }
        },
        orderBy: [{ score: 'desc' }, { createdAt: 'desc' }]
      }),
      (this.prisma as any).lead.count({ where })
    ]);
    
    return {
      data: leads,
      meta: { total, page: parseInt(page), limit: parseInt(limit) }
    };
  }

  async findOne(id: string, tenantId: string) {
    const lead = await (this.prisma as any).lead.findFirst({
      where: { id, tenantId },
      include: { 
        contact: true, 
        owner: { select: { id: true, fullName: true, email: true } }
      },
    });
    
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    
    return lead;
  }

  async update(id: string, data: any, tenantId: string) {
    const result = await (this.prisma as any).lead.updateMany({
      where: { id, tenantId },
      data,
    });

    if (result.count === 0) {
      throw new NotFoundException('Lead not found');
    }

    const updatedLead = await this.findOne(id, tenantId);
    
    // Trigger workflows
    await this.workflowEngine.triggerWorkflows('lead_updated', 'lead', updatedLead, tenantId);

    return updatedLead;
  }

  async remove(id: string, tenantId: string) {
    const result = await (this.prisma as any).lead.deleteMany({
      where: { id, tenantId },
    });
    
    if (result.count === 0) {
      throw new NotFoundException('Lead not found');
    }
    
    return { message: 'Lead deleted successfully' };
  }

  async convertToOpportunity(leadId: string, convertDto: ConvertLeadDto, tenantId: string, ownerId: string) {
    const lead = await this.findOne(leadId, tenantId);
    
    if (!lead.contactId) {
      throw new NotFoundException('Lead must have a contact to convert to opportunity');
    }
    
    return (this.prisma as any).$transaction(async (tx: any) => {
      // Create opportunity
      const opportunity = await tx.opportunity.create({
        data: {
          name: convertDto.opportunityName,
          amount: convertDto.amount,
          currency: convertDto.currency || 'USD',
          stage: convertDto.stage,
          expectedCloseDate: convertDto.expectedCloseDate ? new Date(convertDto.expectedCloseDate) : null,
          contactId: lead.contactId!,
          ownerId,
          tenantId
        }
      });
      
      // Update lead status to converted
      await tx.lead.update({
        where: { id: leadId },
        data: { status: 'converted' }
      });
      
      return { lead, opportunity };
    });
  }

  async updateScore(leadId: string, score: number, tenantId: string) {
    const result = await (this.prisma as any).lead.updateMany({
      where: { id: leadId, tenantId },
      data: { score }
    });
    
    if (result.count === 0) {
      throw new NotFoundException('Lead not found');
    }
    
    return this.findOne(leadId, tenantId);
  }

  async getLeadSources(tenantId: string) {
    const sources = await (this.prisma as any).lead.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: { source: true },
      orderBy: { _count: { source: 'desc' } }
    });
    
    return sources.map(s => ({
      source: s.source,
      count: s._count.source
    }));
  }

  private calculateLeadScore(data: CreateLeadDto): number {
    let score = 0;
    
    // Score based on source
    const sourceScores: Record<string, number> = {
      'referral': 30,
      'website': 20,
      'social_media': 15,
      'email_campaign': 10,
      'cold_call': 5
    };
    
    score += sourceScores[data.source] || 10;
    
    // Score based on contact existence
    if (data.contactId) score += 20;
    
    return Math.min(score, 100);
  }

  async importCsv(file: any, tenantId: string, ownerId: string) {
    return { message: 'CSV import functionality to be implemented' };
  }
}