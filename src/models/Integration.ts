import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';

@Table({
  tableName: 'integrations',
  timestamps: true,
  underscored: true,
})
export class Integration extends Model {
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
  provider!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  config!: object;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  credentials!: object;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  })
  isActive!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_sync',
  })
  lastSync!: Date | null;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;
}
