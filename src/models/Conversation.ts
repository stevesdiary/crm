import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';

@Table({
  tableName: 'conversations',
  timestamps: false,
  underscored: true,
})
export class Conversation extends Model {
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
  channel!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  participants!: object;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  messages!: object;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;
}
