const express = require("express");
const router = express.Router();
const taskService = require("../services/taskService");

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
router.get('/health', async(req, res, next) => {
    try {
        const response = await taskService.checkHealth();
        return res.json(response);
    } catch (err) {
        next(err);
    }
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
router.get('/tasks', async (req, res, next) => {
    try {
        const tasks = await taskService.getAllTasks(req.query);

        return res.json(tasks);
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
router.get('/tasks/:id', async (req, res, next) => {
    try {
        const task = await taskService.getTaskById(Number(req.params.id));
        return res.json(task);
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
router.post('/tasks', async (req, res, next) => {
    try {
        const task = await taskService.createTask(req.body);
        return res.status(201).json(task);
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
router.put('/tasks/:id', async (req, res, next) => {
    try {
        const task = await taskService.updateTask(
            Number(req.params.id),
            req.body
        );

        return res.json(task);
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
router.delete('/tasks/:id', async (req, res, next) => {
    try {
        await taskService.deleteTask(Number(req.params.id));
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
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await taskService.getStats();
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
router.post('/reset', async (req, res, next) => {
    try {
        const updatedTasks = await taskService.resetTasks();

        return res.json(updatedTasks);
    }
    catch (err) {
        next(err);
    }
});

module.exports = router;