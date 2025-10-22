# File Management System

Complete file management system with Backblaze B2 storage, versioning, and secure sharing.

## Features

### 1. Document Storage with Backblaze B2
- S3-compatible API integration
- Automatic file key generation with tenant isolation
- Support for files up to 50MB
- Metadata storage (original name, mime type, size)

### 2. File Attachments to Records
- Attach files to any entity (contacts, leads, opportunities, tickets)
- Query files by entity type and ID
- Automatic relationship tracking

### 3. Document Versioning
- Upload new versions of existing documents
- Track version history
- Access any previous version
- Parent-child relationship for versions

### 4. Secure File Sharing
- Generate time-limited share links
- Configurable expiration (1 hour to 30 days)
- Token-based access without authentication
- Track access count
- Revoke share links anytime

### 5. File Encryption (Optional)
- AES-256-GCM encryption service included
- Encrypt files before upload
- Decrypt on download

## API Endpoints

### Upload File
```bash
POST /api/v1/files/upload
Content-Type: multipart/form-data

file: <file>
entityType: contact (optional)
entityId: <id> (optional)
```

### Upload New Version
```bash
POST /api/v1/files/:id/version
Content-Type: multipart/form-data

file: <file>
```

### List Documents
```bash
GET /api/v1/files
GET /api/v1/files?entityType=contact&entityId=<id>
GET /api/v1/files?mimeType=pdf
```

### Get Document Details
```bash
GET /api/v1/files/:id
```

### Get Document Versions
```bash
GET /api/v1/files/:id/versions
```

### Download Document
```bash
GET /api/v1/files/:id/download
```

### Delete Document
```bash
DELETE /api/v1/files/:id
```

### Create Share Link
```bash
POST /api/v1/files/:id/share?expiresIn=86400
```

Response:
```json
{
  "id": "share-id",
  "token": "random-token",
  "expiresAt": "2024-12-02T00:00:00Z",
  "url": "http://localhost:3000/api/v1/files/share/random-token"
}
```

### Get Document Shares
```bash
GET /api/v1/files/:id/shares
```

### Revoke Share Link
```bash
DELETE /api/v1/files/share/:shareId
```

### Download via Share Link (Public)
```bash
GET /api/v1/files/share/:token
```

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
# Backblaze B2 Storage
B2_KEY_ID="your-key-id"
B2_APPLICATION_KEY="your-app-key"
B2_BUCKET_NAME="your-bucket"
B2_ENDPOINT="s3.us-west-002.backblazeb2.com"

# File Encryption (optional)
FILE_ENCRYPTION_KEY="generate-with-openssl-rand-hex-32"

# App URL
APP_URL="http://localhost:3000"
```

### 3. Run Database Migration
```bash
npx prisma migrate dev
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

## Database Schema

### Document Model
```prisma
model Document {
  id            String      @id @default(cuid())
  tenantId      String
  filename      String
  originalName  String
  mimeType      String
  size          Int
  storageKey    String
  version       Int         @default(1)
  parentId      String?
  entityType    String?
  entityId      String?
  uploadedBy    String
  createdAt     DateTime    @default(now())
  parent        Document?   @relation("DocumentVersions")
  versions      Document[]  @relation("DocumentVersions")
  shares        FileShare[]
}
```

### FileShare Model
```prisma
model FileShare {
  id          String   @id @default(cuid())
  documentId  String
  tenantId    String
  token       String   @unique
  expiresAt   DateTime
  isActive    Boolean  @default(true)
  accessCount Int      @default(0)
  createdBy   String
  createdAt   DateTime @default(now())
}
```

## Usage Examples

### Upload File with Entity Attachment
```typescript
const formData = new FormData();
formData.append('file', file);

await fetch('/api/v1/files/upload?entityType=contact&entityId=contact-123', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

### Get Contact Documents
```typescript
const response = await fetch('/api/v1/files/entity/contact/contact-123', {
  headers: { Authorization: `Bearer ${token}` },
});
const documents = await response.json();
```

### Create 24-Hour Share Link
```typescript
const response = await fetch('/api/v1/files/doc-123/share?expiresIn=86400', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
});
const { url } = await response.json();
// Share this URL with anyone
```

### Upload New Version
```typescript
const formData = new FormData();
formData.append('file', newVersionFile);

await fetch('/api/v1/files/doc-123/version', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

## Security Features

1. **Tenant Isolation**: All files are scoped to tenants
2. **Role-Based Access**: RBAC controls who can upload/download/delete
3. **Secure Tokens**: Cryptographically random share tokens
4. **Time-Limited Access**: Share links expire automatically
5. **Access Tracking**: Monitor share link usage
6. **Revocable Links**: Disable share links anytime
7. **Encryption Support**: Optional file encryption at rest

## Frontend Component

React component included at `client/src/pages/FilesPage.tsx` with:
- File upload interface
- Document listing with metadata
- Download functionality
- Share link creation with expiration options
- Delete confirmation
- Version tracking display

## Performance Considerations

- Files stored in Backblaze B2 (cost-effective cloud storage)
- Metadata cached in PostgreSQL for fast queries
- Signed URLs for direct downloads (optional)
- Streaming support for large files
- 50MB upload limit (configurable)

## Next Steps

1. Run migration: `npx prisma migrate dev`
2. Configure B2 credentials in `.env`
3. Test file upload via API or UI
4. Create share links and test access
5. Monitor storage usage in B2 dashboard
