# Task API

A simple, in-memory Task management REST API built with **Node.js** and **Express**, with interactive documentation powered by **Swagger UI**.

There is no database — tasks are stored in memory in a `tasks` array, which starts out as a copy of a `seedTasks` list. You can restore the original seed data at any time via the `/reset` endpoint.

## Features

- Full CRUD for tasks (create, read, update, delete)
- Filtering by completion status and title search
- Task statistics endpoint
- Reset endpoint to restore seed data
- Interactive Swagger UI at `/docs` for testing every endpoint in the browser

## Tech Stack

- Node.js
- Express
- swagger-ui-express (for serving the OpenAPI spec as an interactive UI)

## Project Structure

```
.
├── server.js       # Express app, seed data, and all route handlers
├── openapi.js       # OpenAPI 3.0 spec consumed by Swagger UI
├── package.json     # Dependencies and npm scripts
└── README.md
```

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

   Or, for auto-restart on file changes during development:

   ```bash
   npm run dev
   ```

4. The API will be running at:

   ```
   http://localhost:3000
   ```

5. Open the interactive Swagger docs at:

   ```
   http://localhost:3000/docs
   ```

## Seed Data

The API starts with 3 seed tasks:

| id  | title                    | done  |
|-----|--------------------------|-------|
| 1   | Buy groceries            | false |
| 2   | Clean the house          | true  |
| 3   | Finish project report    | false |

## Endpoints

| Method | Path          | Description                                                                 |
|--------|---------------|-------------------------------------------------------------------------------|
| GET    | `/`           | Returns basic API info (name, version, endpoints)                            |
| GET    | `/health`     | Returns server health status                                                 |
| GET    | `/tasks`      | Returns tasks, optionally filtered by `done` and/or `search` query params    |
| GET    | `/tasks/:id`  | Returns a single task by id, or 404 if not found                             |
| POST   | `/tasks`      | Creates a new task (requires `title` in body); id and `done` auto-generated  |
| PUT    | `/tasks/:id`  | Updates a task's `title` and/or `done` fields                                |
| DELETE | `/tasks/:id`  | Deletes a task by id                                                         |
| GET    | `/stats`      | Returns `{ total, done, open }` counts                                       |
| POST   | `/reset`      | Resets the task list back to the original seed data                         |

### Details & Examples

#### `GET /`

```bash
curl http://localhost:3000/
```

```json
{ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] }
```

#### `GET /health`

```bash
curl http://localhost:3000/health
```

```json
{ "status": "ok" }
```

#### `GET /tasks`

Optional query params:
- `done` — must be `"true"` or `"false"`. Any other value returns `400`.
- `search` — filters tasks whose `title` contains the given substring (case-insensitive).

```bash
curl "http://localhost:3000/tasks?done=true"
curl "http://localhost:3000/tasks?search=house"
curl "http://localhost:3000/tasks?done=false&search=report"
```

Invalid `done` value:

```bash
curl "http://localhost:3000/tasks?done=maybe"
# 400 -> { "error": "Invalid value for 'done'. Expected 'true' or 'false', got 'maybe'." }
```

#### `GET /tasks/:id`

```bash
curl http://localhost:3000/tasks/1
```

Not found:

```bash
curl http://localhost:3000/tasks/999
# 404 -> { "error": "Task with id 999 was not found." }
```

#### `POST /tasks`

Requires a `title` field in the JSON body. `id` is auto-generated (next available id), and `done` is randomly set to `true` or `false`.

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Read a book"}'
```

Missing title:

```bash
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{}'
# 400 -> { "error": "Request body must contain a 'title' field." }
```

Success response: `201` with the full updated task list.

#### `PUT /tasks/:id`

Updates `title` and/or `done`. `done` must be a boolean if provided.

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"done": true}'
```

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries and cook dinner"}'
```

Errors:
- Empty body or no valid fields → `400`
- Invalid type for `done` (not a boolean) → `400`
- Task id not found → `404`

Success response: `200` with the full updated task list.

#### `DELETE /tasks/:id`

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

- Success → `204` with no body
- Not found → `404` with `{ "error": "Task with id X was not found." }`

#### `GET /stats`

```bash
curl http://localhost:3000/stats
```

```json
{ "total": 3, "done": 1, "open": 2 }
```

#### `POST /reset`

Resets the working `tasks` list back to the original 3 seed tasks.

```bash
curl -X POST http://localhost:3000/reset
```

Returns `200` with the reset task list.

## Testing via Swagger UI

Once the server is running, visit:

```
http://localhost:3000/docs
```

This gives you an interactive page where you can expand each endpoint, fill in parameters or a request body, and click **"Try it out"** to send real requests to the running server without needing `curl` or Postman.

## Notes

- Data is stored **in memory only** — restarting the server resets `tasks` back to the seed data automatically (or you can trigger a reset manually via `POST /reset` without restarting).
- No authentication is implemented; this is intended as a learning/demo API.
