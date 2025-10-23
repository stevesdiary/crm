import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';

@Table({
  tableName: 'workflows',
  timestamps: true,
  underscored: true,
})
export class Workflow extends Model {
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
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  trigger!: object;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  conditions!: object;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  actions!: object;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  })
  isActive!: boolean;

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
}
