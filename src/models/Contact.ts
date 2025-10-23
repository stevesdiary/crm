import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { User } from './User';
import { Lead } from './Lead';
import { Opportunity } from './Opportunity';
import { Ticket } from './Ticket';
import { Communication } from './Communication';

@Table({
  tableName: 'contacts',
  timestamps: true,
  underscored: true,
})
export class Contact extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
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
    field: 'first_name',
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'last_name',
  })
  lastName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  company!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  address!: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'custom_fields',
  })
  customFields!: object | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'created_by',
  })
  createdBy!: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @BelongsTo(() => User, 'createdBy')
  creator!: User;

  @HasMany(() => Lead)
  leads!: Lead[];

  @HasMany(() => Opportunity)
  opportunities!: Opportunity[];

  @HasMany(() => Ticket)
  tickets!: Ticket[];

  @HasMany(() => Communication)
  communications!: Communication[];
}
