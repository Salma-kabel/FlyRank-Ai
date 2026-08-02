const db = require("./connection");

async function init() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            done BOOLEAN,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
        );
    `);

    const result = await db.query(`
        SELECT COUNT(*) AS count
        FROM tasks
    `);

    if (parseInt(result.rows[0].count) === 0) {
        const now = new Date();

        await db.query(`
            INSERT INTO tasks 
            (title, done, created_at, updated_at)
            VALUES
            ($1, $2, $3, $4),
            ($5, $6, $7, $8),
            ($9, $10, $11, $12)
        `,
        [
            "Buy a book",
            false,
            now,
            now,

            "Read a book",
            true,
            now,
            now,

            "Cook a meal",
            false,
            now,
            now
        ]);
    }

    console.log("Database initialized");
}

module.exports = init;