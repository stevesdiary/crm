import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { Document } from './Document';
import { User } from './User';

@Table({
  tableName: 'file_shares',
  timestamps: true,
  underscored: true,
})
export class FileShare extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Document)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'document_id',
  })
  documentId!: string;

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
    unique: true,
  })
  token!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'expires_at',
  })
  expiresAt!: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  })
  isActive!: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'access_count',
  })
  accessCount!: number;

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

  @BelongsTo(() => Document)
  document!: Document;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @BelongsTo(() => User, 'createdBy')
  creator!: User;
}
