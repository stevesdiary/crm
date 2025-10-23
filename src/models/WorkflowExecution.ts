import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';

@Table({
  tableName: 'workflow_executions',
  timestamps: false,
  underscored: true,
})
export class WorkflowExecution extends Model {
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
    field: 'workflow_id',
  })
  workflowId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'entity_type',
  })
  entityType!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'entity_id',
  })
  entityId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  result!: object | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  error!: string | null;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'executed_at',
  })
  executedAt!: Date;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;
}
