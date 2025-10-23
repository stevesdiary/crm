import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { RolePermission } from './RolePermission';

@Table({
  tableName: 'roles',
  timestamps: false,
  underscored: true,
})
export class Role extends Model {
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
    allowNull: true,
  })
  description!: string | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_system',
  })
  isSystem!: boolean;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @HasMany(() => RolePermission)
  rolePermissions!: RolePermission[];
}
