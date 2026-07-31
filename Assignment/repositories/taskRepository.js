const db = require("../db/connection");

function getTaskById(id) {
    return db.prepare(`
        SELECT id, title, done FROM tasks
        WHERE id = ?
    `).get(id);
}

function getAllTasks(filters = {}) {
    let query = `
        SELECT id, title, done
        FROM tasks
    `;
    const values = [];
    if (filters.search) {
        query += ' WHERE title LIKE ?';
        values.push(`%${filters.search}%`);
    }
    if (filters.done !== undefined) {
        query += filters.search ?
        ' AND done = ?' :
        ' WHERE done = ?';
        values.push(filters.done ? 1 : 0);
    }
    query += ' ORDER BY title ASC';
    return db.prepare(query).all(...values);
}

function createTask(task) {
    return db.prepare(`
        INSERT INTO tasks (id, title, done, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        task.id,
        task.title,
        task.done ? 1 : 0,
        task.created_at,
        task.updated_at
    );
}

function updateTask(id, data) {
    if (data.title !== undefined) {
        db.prepare(`
            UPDATE tasks
            SET title = ?, updated_at = ?
            WHERE id = ?
        `).run(
            data.title,
            new Date().toISOString(),
            id
        );
    }

    if (data.done !== undefined) {
        db.prepare(`
            UPDATE tasks
            SET done = ?, updated_at = ?
            Where id = ?
            `).run(
            data.done ? 1 : 0,
            new Date().toISOString(),
            id
            );
        }
}

function deleteTask(id) {
    return db.prepare(`
        DELETE FROM tasks
        WHERE id = ?
    `).run(id);
}

function getStats() {
    return db.prepare(`
        SELECT COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END), 0) AS done,
        COALESCE(SUM(CASE WHEN done = 0 THEN 1 ELSE 0 END), 0) AS open
        FROM tasks
    `).get();
}

function resetTasks() {
    const now = new Date().toISOString();
    db.prepare('DELETE FROM tasks').run();
    db.prepare(`
    INSERT INTO tasks (id, title, done, created_at, updated_at)
    VALUES
        (1, 'Buy a book', 0, ?, ?),
        (2, 'Read a book', 1, ?, ?),
        (3, 'Cook a meal', 0, ?, ?)
    `).run(
        now, now,
        now, now,
        now, now
    );
    return db.prepare(`
        SELECT id, title, done FROM tasks
        ORDER BY title ASC
    `).all();
}

function getNextId() {
    const row = db.prepare(`
        SELECT MAX(id) AS maxId
        FROM tasks
    `).get();
    return row.maxId === null ? 1 : row.maxId + 1;
}

module.exports = {
    getTaskById,
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    getStats,
    resetTasks,
    getNextId
};