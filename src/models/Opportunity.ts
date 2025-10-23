import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { Contact } from './Contact';
import { User } from './User';
import { Quote } from './Quote';

@Table({
  tableName: 'opportunities',
  timestamps: true,
  underscored: true,
})
export class Opportunity extends Model {
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
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.STRING,
    defaultValue: 'USD',
  })
  currency!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  stage!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'expected_close_date',
  })
  expectedCloseDate!: Date | null;

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

  @HasMany(() => Quote)
  quotes!: Quote[];
}
