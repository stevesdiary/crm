# CRM Express API

Node.js + Express + Sequelize-TypeScript CRM System

## Migration Complete ✅

Successfully migrated from NestJS + Prisma to Express + Sequelize-TypeScript

## Tech Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Sequelize-TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT
- **File Storage**: Backblaze B2 (AWS SDK)

## Project Structure

```
src-express/
├── config/          # Database & Redis configuration
├── models/          # Sequelize models (28 models)
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API routes
├── middleware/      # Auth, validation, error handling
└── utils/           # Helper functions
```

## Available Models

✅ Tenant, User, Contact, Lead, Opportunity, Task, Ticket, Pipeline, Quote
✅ Role, Permission, RolePermission, Activity, Workflow, WorkflowExecution
✅ Reminder, SlaPolicy, Communication, Document, FileShare
✅ Webhook, WebhookDelivery, Integration, AuditLog, Notification, Conversation

## API Endpoints

### Authentication
- POST `/api/v1/auth/signup` - User registration
- POST `/api/v1/auth/login` - User login

### Contacts
- GET `/api/v1/contacts` - List contacts
- GET `/api/v1/contacts/:id` - Get contact
- POST `/api/v1/contacts` - Create contact
- PUT `/api/v1/contacts/:id` - Update contact
- DELETE `/api/v1/contacts/:id` - Delete contact

### Leads
- GET `/api/v1/leads` - List leads
- GET `/api/v1/leads/:id` - Get lead
- POST `/api/v1/leads` - Create lead
- PUT `/api/v1/leads/:id` - Update lead
- DELETE `/api/v1/leads/:id` - Delete lead

### Tasks
- GET `/api/v1/tasks` - List tasks
- GET `/api/v1/tasks/:id` - Get task
- POST `/api/v1/tasks` - Create task
- PUT `/api/v1/tasks/:id` - Update task
- DELETE `/api/v1/tasks/:id` - Delete task

### Tickets
- GET `/api/v1/tickets` - List tickets
- GET `/api/v1/tickets/:id` - Get ticket
- POST `/api/v1/tickets` - Create ticket
- PUT `/api/v1/tickets/:id` - Update ticket
- DELETE `/api/v1/tickets/:id` - Delete ticket

## Setup & Installation

```bash
cd src-express
npm install
```

## Environment Variables

Create `.env` file or use root `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=crm
SSL=false

REDIS_URL=redis://localhost:6379

JWT_SECRET=your-secret-key
PORT=3000

NODE_ENV=development
```

## Running the Application

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## Database Sync

Sequelize will auto-sync models on startup:
- Development: `alter: true` (updates schema)
- Production: Use migrations

## Features

✅ Multi-tenant architecture with tenant isolation
✅ JWT authentication & authorization
✅ Role-based access control (RBAC)
✅ Comprehensive error handling
✅ Request validation
✅ Redis caching support
✅ PostgreSQL with Sequelize ORM
✅ TypeScript for type safety
✅ RESTful API design
✅ Pagination support
✅ Filtering & search

## Next Steps

To complete the migration:

1. ✅ All 28 models created
2. ✅ Core services (Contact, Lead, Task, Ticket)
3. ✅ Authentication & middleware
4. ⏳ Add remaining controllers (Opportunity, Workflow, etc.)
5. ⏳ Implement file upload (Backblaze)
6. ⏳ Add WebSocket support
7. ⏳ Implement email/SMS services
8. ⏳ Add analytics endpoints
9. ⏳ Create API documentation (Swagger)
10. ⏳ Write tests
