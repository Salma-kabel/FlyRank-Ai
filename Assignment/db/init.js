const db = require("./connection");

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