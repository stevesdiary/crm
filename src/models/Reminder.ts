import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { Task } from './Task';
import { User } from './User';

@Table({
  tableName: 'reminders',
  timestamps: true,
  underscored: true,
})
export class Reminder extends Model {
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

  @ForeignKey(() => Task)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'task_id',
  })
  taskId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'email',
  })
  type!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  time!: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  sent!: boolean;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @BelongsTo(() => Task)
  task!: Task;

  @BelongsTo(() => User)
  user!: User;
}
