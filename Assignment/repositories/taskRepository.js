const db = require("../db/connection");

async function getTaskById(id) {
    const result = await db.query(
        `
        SELECT id, title, done
        FROM tasks
        WHERE id = $1
        `,
        [id]
    );
    return result.rows[0];
}
async function getAllTasks(filters = {}) {
    let query = `
        SELECT id, title, done
        FROM tasks
    `;

    const values = [];
    const conditions = [];

    if (filters.search) {
        values.push(`%${filters.search}%`);
        conditions.push(`title ILIKE $${values.length}`);
    }
    if (filters.done !== undefined) {
        values.push(filters.done);
        conditions.push(`done = $${values.length}`);
    }
    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY title ASC";
    const result = await db.query(query, values);
    return result.rows;
}

async function createTask(task) {
    const result = await db.query(
        `
        INSERT INTO tasks
        (title, done, created_at, updated_at)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            task.title,
            task.done,
            task.created_at,
            task.updated_at
        ]
    );
    return result.rows[0];
}

async function updateTask(id, data) {
    const fields = [];
    const values = [];

    if (data.title !== undefined) {
        values.push(data.title);
        fields.push(`title = $${values.length}`);
    }
    if (data.done !== undefined) {
        values.push(data.done);
        fields.push(`done = $${values.length}`);
    }
    values.push(new Date());
    fields.push(`updated_at = $${values.length}`);
    values.push(id);

    const result = await db.query(
        `
        UPDATE tasks
        SET ${fields.join(", ")}
        WHERE id = $${values.length}
        RETURNING *
        `,
        values
    );
    return result.rows[0];
}

async function deleteTask(id) {
    const result = await db.query(
        `
        DELETE FROM tasks
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );
    return result.rows[0];
}

async function getStats() {
    const result = await db.query(
        `
        SELECT 
        COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN done THEN 1 ELSE 0 END),0) AS done,
        COALESCE(SUM(CASE WHEN NOT done THEN 1 ELSE 0 END),0) AS open
        FROM tasks
        `
    );
    return result.rows[0];
}

async function resetTasks() {
    const now = new Date();

    await db.query("TRUNCATE TABLE tasks RESTART IDENTITY");
    await db.query(
        `
        INSERT INTO tasks
        (title, done, created_at, updated_at)
        VALUES
        ($1, $2, $3, $4),
        ($5, $6, $7, $8),
        ($9, $10, $11, $12)
        `,
        [
            "Buy a book", false, now, now,
            "Read a book", true, now, now,
            "Cook a meal", false, now, now
        ]
    );

    const result = await db.query(
        `
        SELECT id,title,done
        FROM tasks
        ORDER BY title ASC
        `
    );
    return result.rows;
}

module.exports = {
    getTaskById,
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    getStats,
    resetTasks
};