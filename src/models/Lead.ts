import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { Contact } from './Contact';
import { User } from './User';

@Table({
  tableName: 'leads',
  timestamps: true,
  underscored: true,
})
export class Lead extends Model {
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
    allowNull: true,
    field: 'contact_id',
  })
  contactId!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  source!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  score!: number | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'owner_id',
  })
  ownerId!: string;

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

  @BelongsTo(() => User, 'ownerId')
  owner!: User;
}
