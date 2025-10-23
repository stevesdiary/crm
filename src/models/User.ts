import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @ForeignKey(() => Tenant)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  tenantId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'password_hash',
  })
  passwordHash!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'full_name',
  })
  fullName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'role_id',
  })
  roleId!: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_login',
  })
  lastLogin!: Date | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  prefs!: object | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'updated_at',
  })
  declare updatedAt: Date;

  // Associations
  @BelongsTo(() => Tenant)
  tenant!: Tenant;
}