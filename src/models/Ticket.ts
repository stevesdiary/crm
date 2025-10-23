import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { Contact } from './Contact';
import { User } from './User';
import { SlaPolicy } from './SlaPolicy';

@Table({
  tableName: 'tickets',
  timestamps: true,
  underscored: true,
})
export class Ticket extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Tenant)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'tenant_id',
  })
  tenantId!: string;

  @ForeignKey(() => Contact)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'contact_id',
  })
  contactId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  subject!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status!: string;

  @ForeignKey(() => SlaPolicy)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  priority!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'assigned_to',
  })
  assignedTo!: string | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'sla_breached',
  })
  slaBreached!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'response_time',
  })
  responseTime!: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'resolution_time',
  })
  resolutionTime!: number | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'first_response_at',
  })
  firstResponseAt!: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'resolved_at',
  })
  resolvedAt!: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'due_at',
  })
  dueAt!: Date | null;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'updated_at',
  })
  declare updatedAt: Date;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @BelongsTo(() => Contact)
  contact!: Contact;

  @BelongsTo(() => User, 'assignedTo')
  assignee!: User;

  @BelongsTo(() => SlaPolicy, 'priority')
  slaPolicy!: SlaPolicy;
}
