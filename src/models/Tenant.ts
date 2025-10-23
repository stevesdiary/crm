import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'tenants',
  timestamps: true,
  underscored: true,
})
export class Tenant extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  plan!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  domain!: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  settings!: object | null;

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
  @HasMany(() => User)
  users!: User[];
}