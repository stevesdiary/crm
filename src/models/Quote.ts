import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { Opportunity } from './Opportunity';

@Table({
  tableName: 'quotes',
  timestamps: false,
  underscored: true,
})
export class Quote extends Model {
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

  @ForeignKey(() => Opportunity)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'opportunity_id',
  })
  opportunityId!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  items!: object;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  total!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status!: string;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @BelongsTo(() => Opportunity)
  opportunity!: Opportunity;
}
