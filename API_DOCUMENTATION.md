# CRM API Documentation

Base URL: `http://localhost:3000/api/v1`

## Authentication

All endpoints except `/auth/*` require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### POST /auth/signup
Register new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "fullName": "John Doe",
    "tenantId": "tenant123"
  }
}
```

### POST /auth/login
User login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "fullName": "John Doe",
    "tenantId": "tenant123"
  }
}
```

## Contacts

### GET /contacts
List all contacts (paginated)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### GET /contacts/:id
Get single contact

### POST /contacts
Create contact

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Inc"
}
```

### PUT /contacts/:id
Update contact

### DELETE /contacts/:id
Delete contact

## Leads

### GET /leads
List all leads (paginated)

### GET /leads/:id
Get single lead

### POST /leads
Create lead

**Request:**
```json
{
  "contactId": "contact123",
  "source": "website",
  "status": "new",
  "score": 75
}
```

### PUT /leads/:id
Update lead

### DELETE /leads/:id
Delete lead

## Opportunities

### GET /opportunities
List all opportunities (paginated)

**Query Parameters:**
- `page`, `limit`
- `stage` - Filter by stage
- `ownerId` - Filter by owner

### GET /opportunities/:id
Get single opportunity

### POST /opportunities
Create opportunity

**Request:**
```json
{
  "name": "Big Deal",
  "amount": 50000,
  "currency": "USD",
  "stage": "proposal",
  "contactId": "contact123",
  "expectedCloseDate": "2024-12-31"
}
```

### PUT /opportunities/:id
Update opportunity

### DELETE /opportunities/:id
Delete opportunity

### GET /opportunities/forecast
Get revenue forecast by stage

**Response:**
```json
{
  "proposal": { "total": 150000, "count": 3 },
  "negotiation": { "total": 200000, "count": 5 }
}
```

## Tasks

### GET /tasks
List all tasks (paginated)

**Query Parameters:**
- `status` - Filter by status
- `priority` - Filter by priority
- `assignedTo` - Filter by assignee

### GET /tasks/:id
Get single task

### POST /tasks
Create task

**Request:**
```json
{
  "type": "call",
  "subject": "Follow up call",
  "status": "pending",
  "priority": "high",
  "assignedTo": "user123",
  "dueAt": "2024-12-31T10:00:00Z",
  "notes": "Discuss pricing"
}
```

### PUT /tasks/:id
Update task

### DELETE /tasks/:id
Delete task

## Tickets

### GET /tickets
List all tickets (paginated)

**Query Parameters:**
- `status`, `priority`, `assignedTo`

### GET /tickets/:id
Get single ticket

### POST /tickets
Create ticket

**Request:**
```json
{
  "contactId": "contact123",
  "subject": "Login issue",
  "description": "Cannot login to account",
  "status": "open",
  "priority": "high"
}
```

### PUT /tickets/:id
Update ticket

### DELETE /tickets/:id
Delete ticket

## Analytics

### GET /analytics/dashboard
Get dashboard overview

**Response:**
```json
{
  "contacts": 150,
  "leads": 45,
  "opportunities": 23,
  "openTasks": 12,
  "openTickets": 5,
  "totalRevenue": 500000
}
```

### GET /analytics/sales
Get sales metrics

**Query Parameters:**
- `startDate` (ISO date)
- `endDate` (ISO date)

**Response:**
```json
{
  "proposal": { "count": 5, "total": 150000 },
  "negotiation": { "count": 3, "total": 200000 }
}
```

### GET /analytics/leads/conversion
Get lead conversion rate

**Response:**
```json
{
  "total": 100,
  "converted": 25,
  "rate": 25.0
}
```

### GET /analytics/tickets/metrics
Get ticket metrics

**Response:**
```json
{
  "total": 150,
  "open": 20,
  "resolved": 130,
  "avgResponseTime": 45
}
```

## Notifications

### GET /notifications
Get user notifications

**Query Parameters:**
- `unreadOnly=true` - Only unread notifications

**Response:**
```json
[
  {
    "id": "notif123",
    "type": "info",
    "title": "New lead assigned",
    "message": "You have been assigned a new lead",
    "read": false,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### PUT /notifications/:id/read
Mark notification as read

### PUT /notifications/read-all
Mark all notifications as read

### DELETE /notifications/:id
Delete notification

## Error Responses

All endpoints return standard error format:

```json
{
  "message": "Error description"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting

(To be implemented)

## Pagination

All list endpoints support pagination:
- Default: 10 items per page
- Max: 100 items per page

Response format:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```
