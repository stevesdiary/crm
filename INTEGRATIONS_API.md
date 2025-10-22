# Integration & API Documentation

Complete integration system with webhooks, third-party integrations, Swagger documentation, and rate limiting.

## Features

### 1. Webhook System
- Create webhooks for real-time event notifications
- HMAC signature verification for security
- Automatic retry mechanism
- Delivery tracking and logs
- Support for multiple events per webhook

### 2. Third-Party Integrations
- **Slack**: Send notifications to channels
- **Google Calendar**: Sync events and meetings
- **Gmail/Outlook**: Email synchronization
- **Zapier**: Connect to 3000+ apps
- Encrypted credential storage

### 3. API Documentation (Swagger/OpenAPI)
- Interactive API documentation at `/api/docs`
- Try-it-out functionality
- Request/response examples
- Authentication support

### 4. Rate Limiting
- Redis-based rate limiting
- Configurable limits per endpoint
- IP-based tracking
- Automatic retry-after headers

## Webhook System

### Available Events
```
contact.created      - New contact created
contact.updated      - Contact updated
lead.created         - New lead created
opportunity.created  - New opportunity created
task.completed       - Task marked as complete
ticket.created       - New support ticket
```

### Create Webhook
```bash
POST /api/v1/webhooks
Authorization: Bearer <token>

{
  "name": "Contact Notifications",
  "url": "https://example.com/webhook",
  "events": ["contact.created", "contact.updated"],
  "isActive": true
}
```

Response:
```json
{
  "id": "webhook-id",
  "name": "Contact Notifications",
  "url": "https://example.com/webhook",
  "events": ["contact.created", "contact.updated"],
  "secret": "generated-secret-key",
  "isActive": true
}
```

### Webhook Payload Format
```json
{
  "event": "contact.created",
  "timestamp": "2024-12-01T12:00:00Z",
  "tenantId": "tenant-id",
  "data": {
    "id": "contact-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

### Webhook Signature Verification
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expected = `sha256=${hmac.digest('hex')}`;
  return signature === expected;
}
```

### List Webhooks
```bash
GET /api/v1/webhooks
Authorization: Bearer <token>
```

### Get Webhook Details
```bash
GET /api/v1/webhooks/:id
Authorization: Bearer <token>
```

### Update Webhook
```bash
PATCH /api/v1/webhooks/:id
Authorization: Bearer <token>

{
  "isActive": false
}
```

### Delete Webhook
```bash
DELETE /api/v1/webhooks/:id
Authorization: Bearer <token>
```

### Retry Failed Delivery
```bash
POST /api/v1/webhooks/deliveries/:deliveryId/retry
Authorization: Bearer <token>
```

## Third-Party Integrations

### Available Providers

#### Slack
```json
{
  "provider": "slack",
  "name": "Slack",
  "description": "Send notifications to Slack channels",
  "fields": ["webhookUrl", "channel"]
}
```

#### Google Calendar
```json
{
  "provider": "google_calendar",
  "name": "Google Calendar",
  "description": "Sync calendar events and meetings",
  "fields": ["clientId", "clientSecret", "refreshToken"]
}
```

#### Gmail
```json
{
  "provider": "gmail",
  "name": "Gmail",
  "description": "Sync emails and send messages",
  "fields": ["clientId", "clientSecret", "refreshToken"]
}
```

### Create Integration
```bash
POST /api/v1/integrations
Authorization: Bearer <token>

{
  "provider": "slack",
  "name": "Sales Team Slack",
  "config": {},
  "credentials": {
    "webhookUrl": "https://hooks.slack.com/services/...",
    "channel": "#sales"
  },
  "isActive": true
}
```

### List Integrations
```bash
GET /api/v1/integrations
Authorization: Bearer <token>
```

### Get Available Providers
```bash
GET /api/v1/integrations/providers
Authorization: Bearer <token>
```

### Test Integration
```bash
POST /api/v1/integrations/:id/test
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "Slack connection successful"
}
```

### Sync Integration
```bash
POST /api/v1/integrations/:id/sync
Authorization: Bearer <token>
```

### Delete Integration
```bash
DELETE /api/v1/integrations/:id
Authorization: Bearer <token>
```

## Slack Integration Usage

### Send Notification
```typescript
import { SlackService } from './integrations/slack.service';

// Notify new lead
await slackService.notifyNewLead(webhookUrl, {
  source: 'Website',
  status: 'New',
  score: 85
});

// Notify new ticket
await slackService.notifyTicketCreated(webhookUrl, {
  subject: 'Login Issue',
  priority: 'High'
});

// Custom message
await slackService.sendMessage(webhookUrl, {
  text: 'Custom notification message'
});
```

## Calendar Integration Usage

### Create Event
```typescript
import { CalendarService } from './integrations/calendar.service';

await calendarService.createEvent(credentials, {
  summary: 'Sales Meeting',
  description: 'Quarterly review',
  start: { dateTime: '2024-12-01T10:00:00Z', timeZone: 'UTC' },
  end: { dateTime: '2024-12-01T11:00:00Z', timeZone: 'UTC' },
  attendees: [{ email: 'john@example.com' }]
});
```

### Create Meeting from Task
```typescript
await calendarService.createMeetingFromTask(credentials, task);
```

## API Documentation (Swagger)

### Access Documentation
```
http://localhost:3001/api/docs
```

### Features
- Interactive API explorer
- Authentication with Bearer token
- Request/response examples
- Schema definitions
- Try-it-out functionality

### Adding Swagger Annotations

```typescript
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('api/v1/contacts')
export class ContactsController {
  
  @Post()
  @ApiOperation({ summary: 'Create contact' })
  @ApiResponse({ status: 201, description: 'Contact created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() dto: CreateContactDto) {
    // ...
  }
}
```

## Rate Limiting

### Using Rate Limit Guard

```typescript
import { UseGuards } from '@nestjs/common';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { RateLimit } from './common/decorators/rate-limit.decorator';

@Controller('api/v1/contacts')
@UseGuards(RateLimitGuard)
export class ContactsController {
  
  @Post()
  @RateLimit(10, 60) // 10 requests per 60 seconds
  create(@Body() dto: CreateContactDto) {
    // ...
  }
}
```

### Default Limits
- 100 requests per minute (default)
- Configurable per endpoint
- IP-based tracking
- Redis-backed storage

### Rate Limit Response
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded",
  "retryAfter": 45
}
```

## Triggering Webhooks Programmatically

```typescript
import { WebhooksService } from './webhooks/webhooks.service';

// Trigger webhook for event
await webhooksService.triggerWebhooks(
  'contact.created',
  {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email
  },
  tenantId
);
```

## Security Features

### Webhook Security
- HMAC-SHA256 signature verification
- Secret key per webhook
- Signature in `X-Webhook-Signature` header
- Event type in `X-Webhook-Event` header

### Integration Security
- Encrypted credential storage
- AES-192 encryption
- Credentials never exposed in API responses
- Secure test connections

### Rate Limiting
- Prevents API abuse
- DDoS protection
- Per-IP tracking
- Configurable limits

## Environment Variables

```bash
# Redis for rate limiting
REDIS_URL="redis://localhost:6379"

# Encryption for integration credentials
ENCRYPTION_KEY="your-encryption-key"

# Slack webhook (optional)
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# Google Calendar (optional)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

## Frontend Components

### Integrations Page
- View all integrations
- Add new integrations
- Test connections
- Sync data
- Delete integrations

Location: `client/src/pages/IntegrationsPage.tsx`

### Webhooks Page
- Create webhooks
- Select events
- View delivery logs
- Retry failed deliveries
- Delete webhooks

Location: `client/src/pages/WebhooksPage.tsx`

## Testing

### Test Webhook Locally
```bash
# Use ngrok for local testing
ngrok http 3001

# Create webhook with ngrok URL
POST /api/v1/webhooks
{
  "url": "https://your-ngrok-url.ngrok.io/webhook",
  "events": ["contact.created"]
}
```

### Test Slack Integration
```bash
# Get Slack webhook URL from Slack app settings
# Create integration
POST /api/v1/integrations
{
  "provider": "slack",
  "credentials": {
    "webhookUrl": "https://hooks.slack.com/services/..."
  }
}

# Test connection
POST /api/v1/integrations/:id/test
```

## Best Practices

1. **Webhooks**
   - Always verify signatures
   - Implement idempotency
   - Handle retries gracefully
   - Log all deliveries

2. **Integrations**
   - Store credentials securely
   - Test connections before saving
   - Handle API rate limits
   - Implement proper error handling

3. **Rate Limiting**
   - Set appropriate limits
   - Monitor usage patterns
   - Adjust limits based on load
   - Provide clear error messages

4. **API Documentation**
   - Keep Swagger annotations updated
   - Provide examples
   - Document error responses
   - Include authentication details
