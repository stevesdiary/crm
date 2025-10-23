import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { RolePermission } from './RolePermission';

@Table({
  tableName: 'permissions',
  timestamps: false,
  underscored: true,
})
export class Permission extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  resource!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  action!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  description!: string | null;

  @HasMany(() => RolePermission)
  rolePermissions!: RolePermission[];
}
