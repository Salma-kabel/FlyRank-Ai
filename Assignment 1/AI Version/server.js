const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpecification = require('./openapi');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ---------------------------------------------------------------------------
// Seed data & working data
// ---------------------------------------------------------------------------

const seedTasks = [
  { id: 1, title: 'Buy groceries', done: false },
  { id: 2, title: 'Clean the house', done: true },
  { id: 3, title: 'Finish project report', done: false },
];

// `tasks` is the mutable list the endpoints operate on.
// It starts as a deep copy of seedTasks so seedTasks is never mutated.
let tasks = seedTasks.map((task) => ({ ...task }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getNextId() {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map((t) => t.id)) + 1;
}

function parseBooleanQueryParam(value) {
  // Returns true/false if valid, or null if invalid
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

// ---------------------------------------------------------------------------
// Swagger UI
// ---------------------------------------------------------------------------

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// 1. GET / -> API info
app.get('/', (req, res) => {
  res.json({
    name: 'Task API',
    version: '1.0',
    endpoints: ['/tasks'],
  });
});

// 2. GET /health -> server health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 3. GET /tasks -> list tasks, optionally filtered by `done` and/or `search`
app.get('/tasks', (req, res) => {
  const { done, search } = req.query;
  let result = tasks;

  if (done !== undefined) {
    const parsedDone = parseBooleanQueryParam(done);
    if (parsedDone === null) {
      return res.status(400).json({
        error: `Invalid value for 'done'. Expected 'true' or 'false', got '${done}'.`,
      });
    }
    result = result.filter((task) => task.done === parsedDone);
  }

  if (search !== undefined) {
    const searchTerm = String(search).toLowerCase();
    result = result.filter((task) =>
      task.title.toLowerCase().includes(searchTerm)
    );
  }

  res.json(result);
});

// 4. GET /stats -> task statistics
// NOTE: placed before /tasks/:id so "stats" isn't matched as an id param.
app.get('/stats', (req, res) => {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const open = total - done;
  res.json({ total, done, open });
});

// 5. GET /tasks/:id -> single task
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task with id ${id} was not found.` });
  }

  res.json(task);
});

// 6. POST /tasks -> create a new task
app.post('/tasks', (req, res) => {
  const body = req.body;

  if (!body || Object.keys(body).length === 0 || !body.title) {
    return res.status(400).json({
      error: "Request body must contain a 'title' field.",
    });
  }

  const newTask = {
    id: getNextId(),
    title: String(body.title),
    done: Math.random() < 0.5,
  };

  tasks.push(newTask);
  res.status(201).json(tasks);
});

// 7. PUT /tasks/:id -> update an existing task
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task with id ${id} was not found.` });
  }

  const body = req.body;

  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({ error: 'Request body cannot be empty.' });
  }

  const allowedFields = ['title', 'done'];
  const bodyKeys = Object.keys(body);
  const hasValidField = bodyKeys.some((key) => allowedFields.includes(key));

  if (!hasValidField) {
    return res.status(400).json({
      error: `Request body must include at least one of: ${allowedFields.join(', ')}.`,
    });
  }

  if ('title' in body) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      return res.status(400).json({ error: "'title' must be a non-empty string." });
    }
    task.title = body.title;
  }

  if ('done' in body) {
    if (typeof body.done !== 'boolean') {
      return res.status(400).json({
        error: "'done' must be a boolean (true or false).",
      });
    }
    task.done = body.done;
  }

  res.status(200).json(tasks);
});

// 8. DELETE /tasks/:id -> remove a task
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Task with id ${id} was not found.` });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

// 9. POST /reset -> reset tasks back to the seed data
app.post('/reset', (req, res) => {
  tasks = seedTasks.map((task) => ({ ...task }));
  res.json(tasks);
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Task API running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});

module.exports = app;
