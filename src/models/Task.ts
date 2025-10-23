import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { User } from './User';
import { Reminder } from './Reminder';

@Table({
  tableName: 'tasks',
  timestamps: true,
  underscored: true,
})
export class Task extends Model {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  subject!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'pending',
  })
  status!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'medium',
  })
  priority!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'due_at',
  })
  dueAt!: Date | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'assigned_to',
  })
  assignedTo!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'assigned_by',
  })
  assignedBy!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'related_entity_type',
  })
  relatedEntityType!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'related_entity_id',
  })
  relatedEntityId!: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes!: string | null;

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

  @BelongsTo(() => User, 'assignedTo')
  assignee!: User;

  @BelongsTo(() => User, 'assignedBy')
  assigner!: User;

  @HasMany(() => Reminder)
  reminders!: Reminder[];
}
