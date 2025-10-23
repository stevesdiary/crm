import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { WebhookDelivery } from './WebhookDelivery';

@Table({
  tableName: 'webhooks',
  timestamps: true,
  underscored: true,
})
export class Webhook extends Model {
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
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  url!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  events!: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  secret!: string | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  })
  isActive!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_triggered',
  })
  lastTriggered!: Date | null;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @HasMany(() => WebhookDelivery)
  deliveries!: WebhookDelivery[];
}
