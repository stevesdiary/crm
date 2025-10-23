import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { User } from './User';

@Table({
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
})
export class Notification extends Model {
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  data!: string | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  read!: boolean;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @BelongsTo(() => User)
  user!: User;
}
