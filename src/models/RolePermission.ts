import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Role } from './Role';
import { Permission } from './Permission';

@Table({
  tableName: 'role_permissions',
  timestamps: false,
  underscored: true,
})
export class RolePermission extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'role_id',
  })
  roleId!: string;

  @ForeignKey(() => Permission)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'permission_id',
  })
  permissionId!: string;

  @BelongsTo(() => Role)
  role!: Role;

  @BelongsTo(() => Permission)
  permission!: Permission;
}
