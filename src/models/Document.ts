import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Tenant } from './Tenant';
import { User } from './User';
import { FileShare } from './FileShare';

@Table({
  tableName: 'documents',
  timestamps: true,
  underscored: true,
})
export class Document extends Model {
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
  filename!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'original_name',
  })
  originalName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'mime_type',
  })
  mimeType!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  size!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'storage_key',
  })
  storageKey!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  version!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'parent_id',
  })
  parentId!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'entity_type',
  })
  entityType!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'entity_id',
  })
  entityId!: string | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'uploaded_by',
  })
  uploadedBy!: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @BelongsTo(() => User, 'uploadedBy')
  uploader!: User;

  @BelongsTo(() => Document, 'parentId')
  parent!: Document;

  @HasMany(() => Document, 'parentId')
  versions!: Document[];

  @HasMany(() => FileShare)
  shares!: FileShare[];
}
