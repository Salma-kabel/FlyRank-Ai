const express = require('express');
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task API',
      version: '1.0.0',
    },
  },
  apis: ['./server.js'],
});
const Database = require("better-sqlite3");
const db = new Database("tasks.db");
const port = 3000;


app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    done BOOLEAN,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
`);

const rows = db.prepare(`
    SELECT COUNT(*) AS count
    FROM tasks
`).get();

if (rows.count === 0) {
    const now = new Date().toISOString();

    db.prepare(`
    INSERT INTO tasks (id, title, done, created_at, updated_at)
    VALUES
        (1, 'Buy a book', 0, ?, ?),
        (2, 'Read a book', 1, ?, ?),
        (3, 'Cook a meal', 0, ?, ?)
`).run(now, now, now, now, now, now);
}

function formatTask(task) {
    return {
        id: task.id,
        title: task.title,
        done: Boolean(task.done)
    };
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns information about the API
 *     responses:
 *       200:
 *         description: API information
 */
app.get('/', (req, res) => {
    res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Checks if the server is running
 *     responses:
 *       200:
 *         description: Server is alive and running
 */
app.get('/health', (req, res) => {
    res.json({ "status": "ok" });
});

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Returns all tasks
 *     parameters:
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search term to filter tasks by title
 *       - name: done
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter tasks by completion status
 *     responses:
 *       200:
 *         description: List of all tasks
 *       400:
 *         description: Invalid value for 'done' query parameter
 */
app.get('/tasks', (req, res) => {
    if (req.query.done !== undefined && req.query.done !== 'true' && req.query.done !== 'false') {
        return res.status(400).json({"error": "Invalid value for 'done' query parameter. Must be 'true' or 'false'."});
    }
    const searchTerm = req.query.search ? `%${req.query.search}%` : null;
    const doneTerm = req.query.done ? (req.query.done === 'true' ? 1 : 0) : null;
    let result;
    if (!req.query.search && !req.query.done) {
        result = db.prepare(`
        SELECT id, title, done FROM tasks
        ORDER BY title ASC
        `).all();
    }
    else if (req.query.search && !req.query.done) {
        result = db.prepare(`
        SELECT id, title, done FROM tasks
        WHERE title LIKE ?
        ORDER BY title ASC
        `).all(searchTerm);
    }
    else if (req.query.done && !req.query.search) {
        result =  db.prepare(`
        SELECT id, title, done FROM tasks
        WHERE done = ?
        ORDER BY title ASC
        `).all(doneTerm);
        }
    else {
        result = db.prepare(`
        SELECT id, title, done FROM tasks
        WHERE title LIKE ? AND done = ?
        ORDER BY title ASC
        `).all(searchTerm, doneTerm);
    }

    const total = result.length;
    const limit = req.query.limit !== undefined ? parseInt(req.query.limit) : total;
    const offset = req.query.offset !== undefined ? parseInt(req.query.offset) : 0;

    if (isNaN(limit) || isNaN(offset) || limit < 0 || offset < 0) {
        return res.status(400).json({"error": "'limit' and 'offset' must be non-negative numbers"});
    }

    result = result.slice(offset, offset + limit);

    return res.json({
        tasks: result.map(formatTask)
    });
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Returns a specific task by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Unknown task ID
 */
app.get('/tasks/:id', (req, res) => {
    const task = db.prepare(`
        SELECT id, title, done FROM tasks
        WHERE id = ?
    `).get(Number(req.params.id));
    if (task) {
        return res.json(formatTask(task));
    }
    return res.status(404).json({
        "error": `Task ${req.params.id} not found`
    });
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Title is missing or empty
 */
app.post('/tasks', (req, res) => {
    const title = req.body.title;
    if (title === undefined) {
        return res.status(400).json({"error": "title is missing"});
    }
    else if (typeof title !== 'string' || title.trim() === "") {
        return res.status(400).json({"error": "Invalid title. Title must be a non-empty string."});
    }

    const task = { title, done: false, created_at: new Date().toISOString(),
         updated_at: new Date().toISOString() };
    db.prepare(`
        INSERT INTO tasks (title, done, created_at, updated_at)
        VALUES (?, ?, ?, ?)
    `).run(task.title, task.done? 1 : 0, task.created_at, task.updated_at);
    return res.status(201).json(formatTask(task));
});

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Updates an existing task by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               done:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Empty/invalid body
 *       404:
 *         description: Unknown task ID
 */
app.put('/tasks/:id', (req, res) => {
    const task = db.prepare(`
        SELECT * FROM tasks
        WHERE id = ?
        `).get(Number(req.params.id));
    if (!task) {
        return res.status(404).json({"error": `Task ${req.params.id} not found`});
    }
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({"error": "body is missing"});
    }
    if (req.body.title === undefined && req.body.done === undefined) {
        return res.status(400).json({"error": "body must contain at least one of 'title' or 'done'"});
    }
    if (req.body.title !== undefined) {
        if (typeof req.body.title !== 'string' || req.body.title.trim() === '') {
            return res.status(400).json({ error: "'title' must be a non-empty string" });
        }
        db.prepare(`
        UPDATE tasks
        SET title = ?, updated_at = ?
        WHERE id = ?
        `).run(req.body.title, new Date().toISOString(), Number(req.params.id));
    }
    if (req.body.done !== undefined) {
        if (typeof req.body.done !== 'boolean') {
            return res.status(400).json({ error: "'done' must be a boolean" });
        }
        db.prepare(`
        UPDATE tasks
        SET done = ?, updated_at = ?
        WHERE id = ?
        `).run(req.body.done ? 1 : 0, new Date().toISOString(), Number(req.params.id));
    }
    const updatedTask = db.prepare(`
        SELECT id, title, done FROM tasks
        WHERE id = ?
        `).get(Number(req.params.id));

    return res.json(formatTask(updatedTask));
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Deletes a specific task by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       404:
 *         description: Unknown task ID
 */
app.delete('/tasks/:id', (req, res) => {
    const task = db.prepare(`
        SELECT * FROM tasks
        WHERE id = ?
        `).get(Number(req.params.id));

    if (!task) {
        return res.status(404).json({"error": `Task ${req.params.id} not found`});
    }
    db.prepare(`
        DELETE FROM tasks
        WHERE id = ?
        `).run(req.params.id);
    return res.status(204).send();
});

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Returns statistics about the tasks
 *     responses:
 *       200:
 *         description: Statistics of tasks
 */
app.get('/stats', (req, res) => {
    const stats = db.prepare(`
        SELECT COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END), 0) AS done,
        COALESCE(SUM(CASE WHEN done = 0 THEN 1 ELSE 0 END), 0) AS open
        FROM tasks
    `).get();
    return res.json(stats);
});

/**
 * @swagger
 * /reset:
 *   post:
 *     summary: Resets the tasks to the initial state
 *     responses:
 *       200:
 *         description: Tasks reset successfully
 */
app.post('/reset', (req, res) => {
    const now = new Date().toISOString();
    db.prepare('DELETE FROM tasks').run();
    db.prepare(`
    INSERT INTO tasks (title, done, created_at, updated_at)
    VALUES
        ('Buy a book', 0, ?, ?),
        ('Read a book', 1, ?, ?),
        ('Cook a meal', 0, ?, ?)
    `).run(now, now, now, now, now, now);
    const updatedTasks = db.prepare(`
        SELECT id, title, done FROM tasks
        ORDER BY title ASC
        `).all();
    return res.json(updatedTasks.map(formatTask));
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});