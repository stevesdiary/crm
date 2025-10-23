import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { User } from './User';

@Table({
  tableName: 'audit_logs',
  timestamps: false,
  underscored: true,
})
export class AuditLog extends Model {
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
    field: 'actor_id',
  })
  actorId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  action!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  target!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  details!: object | null;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  timestamp!: Date;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @BelongsTo(() => User, 'actorId')
  actor!: User;
}
