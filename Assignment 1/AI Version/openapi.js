// openapi.js
// OpenAPI 3.0 specification consumed by swagger-ui-express in server.js.
// Visiting /docs will render this spec as an interactive Swagger UI page.

const openapiSpecification = {
  openapi: '3.0.0',
  info: {
    title: 'Task API',
    version: '1.0.0',
    description:
      'A simple in-memory Task management API built with Node.js and Express.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'General', description: 'API info and health checks' },
    { name: 'Tasks', description: 'Task CRUD operations' },
    { name: 'Stats', description: 'Task statistics' },
    { name: 'Admin', description: 'Reset operations' },
  ],
  components: {
    schemas: {
      Task: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Buy groceries' },
          done: { type: 'boolean', example: false },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Task with id 99 was not found.' },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['General'],
        summary: 'Get API information',
        responses: {
          200: {
            description: 'Basic information about the API',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Task API' },
                    version: { type: 'string', example: '1.0' },
                    endpoints: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['/tasks'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['General'],
        summary: 'Check server health',
        responses: {
          200: {
            description: 'Server is alive',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                },
              },
            },
          },
        },
      },
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks',
        description:
          'Returns all tasks, optionally filtered by `done` and/or `search`.',
        parameters: [
          {
            name: 'done',
            in: 'query',
            required: false,
            description: "Filter by completion status. Must be 'true' or 'false'.",
            schema: { type: 'string', enum: ['true', 'false'] },
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            description: 'Filter tasks whose title includes this substring.',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'A list of tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Task' },
                },
              },
            },
          },
          400: {
            description: "Invalid value provided for 'done'",
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a new task',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Read a book' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Task created successfully. Returns the full task list.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Task' },
                },
              },
            },
          },
          400: {
            description: "Missing or empty 'title' in the request body",
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get a task by id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'The requested task',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Task' } },
            },
          },
          404: {
            description: 'Task not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update a task',
        description: "Update a task's `title` and/or `done` fields.",
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Updated title' },
                  done: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Task updated successfully. Returns the full task list.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Task' },
                },
              },
            },
          },
          400: {
            description: 'Empty or invalid request body',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
          404: {
            description: 'Task not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          204: { description: 'Task deleted successfully (no content returned)' },
          404: {
            description: 'Task not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
    '/stats': {
      get: {
        tags: ['Stats'],
        summary: 'Get task statistics',
        responses: {
          200: {
            description: 'Task counts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 3 },
                    done: { type: 'integer', example: 1 },
                    open: { type: 'integer', example: 2 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/reset': {
      post: {
        tags: ['Admin'],
        summary: 'Reset tasks to seed data',
        responses: {
          200: {
            description: 'Tasks reset successfully. Returns the reset task list.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Task' },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = openapiSpecification;
