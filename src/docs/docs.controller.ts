import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('api/docs')
export class DocsController {
  @Get()
  getDocs(@Res() res: Response) {
    const apiDocs = {
      openapi: '3.0.0',
      info: {
        title: 'CRM API',
        version: '1.0.0',
        description: 'Comprehensive CRM API with multi-tenant support'
      },
      servers: [
        { url: '/api/v1', description: 'Production server' }
      ],
      security: [{ bearerAuth: [] }],
      paths: {
        '/contacts': {
          get: {
            summary: 'Get all contacts',
            tags: ['Contacts'],
            parameters: [
              { name: 'page', in: 'query', schema: { type: 'integer' } },
              { name: 'limit', in: 'query', schema: { type: 'integer' } },
              { name: 'search', in: 'query', schema: { type: 'string' } }
            ],
            responses: {
              200: {
                description: 'List of contacts',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: { type: 'array', items: { $ref: '#/components/schemas/Contact' } },
                        meta: { $ref: '#/components/schemas/PaginationMeta' }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Create a new contact',
            tags: ['Contacts'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateContact' }
                }
              }
            },
            responses: {
              201: {
                description: 'Contact created',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Contact' }
                  }
                }
              }
            }
          }
        },
        '/tasks': {
          get: {
            summary: 'Get all tasks',
            tags: ['Tasks'],
            parameters: [
              { name: 'status', in: 'query', schema: { type: 'string' } },
              { name: 'assignedTo', in: 'query', schema: { type: 'string' } }
            ],
            responses: {
              200: {
                description: 'List of tasks',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' }
                    }
                  }
                }
              }
            }
          }
        },
        '/webhooks': {
          get: {
            summary: 'Get all webhooks',
            tags: ['Webhooks'],
            responses: {
              200: {
                description: 'List of webhooks',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Webhook' }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Create a webhook',
            tags: ['Webhooks'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateWebhook' }
                }
              }
            },
            responses: {
              201: {
                description: 'Webhook created',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Webhook' }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: {
          Contact: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              company: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          CreateContact: {
            type: 'object',
            required: ['firstName', 'lastName'],
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              company: { type: 'string' }
            }
          },
          Task: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              subject: { type: 'string' },
              status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
              priority: { type: 'string', enum: ['low', 'medium', 'high'] },
              assignedTo: { type: 'string' },
              dueAt: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          Webhook: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              url: { type: 'string' },
              events: { type: 'array', items: { type: 'string' } },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          CreateWebhook: {
            type: 'object',
            required: ['name', 'url', 'events'],
            properties: {
              name: { type: 'string' },
              url: { type: 'string' },
              events: { type: 'array', items: { type: 'string' } }
            }
          },
          PaginationMeta: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' }
            }
          }
        }
      }
    };

    res.json(apiDocs);
  }

  @Get('ui')
  getDocsUI(@Res() res: Response) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CRM API Documentation</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-bundle.js"></script>
      <script>
        SwaggerUIBundle({
          url: '/api/docs',
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.presets.standalone
          ]
        });
      </script>
    </body>
    </html>
    `;
    
    res.send(html);
  }
}