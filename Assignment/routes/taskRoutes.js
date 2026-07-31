const express = require("express");
const router = express.Router();
const taskService = require("../services/taskService");

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
router.get('/', (req, res) => {
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
router.get('/health', (req, res) => {
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
router.get('/tasks', (req, res, next) => {
    try {
        const tasks = taskService.getAllTasks(req.query);

        return res.json({
            tasks: tasks.map(formatTask)
        });
    }
    catch (err) {
        next(err);
    }
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
router.get('/tasks/:id', (req, res, next) => {
    try {
        const task = taskService.getTaskById(Number(req.params.id));
        return res.json(formatTask(task));
    }
    catch (err) {
        next(err);
    }
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
router.post('/tasks', (req, res, next) => {
    try {
        const task = taskService.createTask(req.body);
        return res.status(201).json(formatTask(task));
    } catch (err) {
        next(err);
    }
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
router.put('/tasks/:id', (req, res, next) => {
    try {
        const task = taskService.updateTask(
            Number(req.params.id),
            req.body
        );

        return res.json(formatTask(task));
    }
    catch (err) {
        next(err);
    }
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
router.delete('/tasks/:id', (req, res, next) => {
    try {
        taskService.deleteTask(Number(req.params.id));
        return res.status(204).send();
    }
    catch (err) {
        next(err);
    }
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
router.get('/stats', (req, res, next) => {
    try {
        const stats = taskService.getStats();
        return res.json(stats);
    }
    catch (err) {
        next(err);
    }
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
router.post('/reset', (req, res, next) => {
    try {
        const updatedTasks = taskService.resetTasks();

        return res.json(updatedTasks.map(formatTask));
    }
    catch (err) {
        next(err);
    }
});

module.exports = router;