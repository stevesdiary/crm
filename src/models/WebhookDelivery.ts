import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Webhook } from './Webhook';

@Table({
  tableName: 'webhook_deliveries',
  timestamps: false,
  underscored: true,
})
export class WebhookDelivery extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Webhook)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'webhook_id',
  })
  webhookId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  event!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  payload!: object;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  response!: object | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  attempts!: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'delivered_at',
  })
  deliveredAt!: Date;

  @BelongsTo(() => Webhook)
  webhook!: Webhook;
}
