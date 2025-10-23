import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { Contact } from './Contact';
import { User } from './User';

@Table({
  tableName: 'communications',
  timestamps: true,
  underscored: true,
})
export class Communication extends Model {
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

  @ForeignKey(() => Contact)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'contact_id',
  })
  contactId!: string;

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
  direction!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  subject!: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  content!: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  duration!: number | null;

  @Column({
    type: DataType.STRING,
    defaultValue: 'completed',
  })
  status!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata!: object | null;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @BelongsTo(() => Contact)
  contact!: Contact;

  @BelongsTo(() => User)
  user!: User;
}
