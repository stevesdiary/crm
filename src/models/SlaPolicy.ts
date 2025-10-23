import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { Ticket } from './Ticket';

@Table({
  tableName: 'sla_policies',
  timestamps: false,
  underscored: true,
})
export class SlaPolicy extends Model {
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
    unique: true,
  })
  priority!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'response_time',
  })
  responseTime!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'resolution_time',
  })
  resolutionTime!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'business_hours_only',
  })
  businessHoursOnly!: boolean;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @HasMany(() => Ticket)
  tickets!: Ticket[];
}
