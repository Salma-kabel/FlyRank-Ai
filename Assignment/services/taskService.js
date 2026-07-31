const taskRepository = require("../repositories/taskRepository");
const { ValidationError, NotFoundError } = require("../errors");

function getAllTasks(query) {
    if (
        query.done !== undefined &&
        query.done !== "true" &&
        query.done !== "false"
    ) {
        throw new ValidationError(
            "Invalid value for 'done'. Must be 'true' or 'false'."
        );
    }

    let result = taskRepository.getAllTasks({
        search: query.search,
        done:
            query.done === undefined
                ? undefined
                : query.done === "true"
    });

    const total = result.length;

    const limit =
        query.limit !== undefined
            ? parseInt(query.limit)
            : total;

    const offset =
        query.offset !== undefined
            ? parseInt(query.offset)
            : 0;

    if (
        isNaN(limit) ||
        isNaN(offset) ||
        limit < 0 ||
        offset < 0
    ) {
        throw new ValidationError(
            "'limit' and 'offset' must be non-negative numbers"
        );
    }

    return result.slice(offset, offset + limit);
}

function createTask(data) {
    if (!data) {
        throw new ValidationError("Body is missing");
    }

    const { title } = data;
    if (title === undefined) {
        throw new ValidationError("title is missing");
    }
    if (typeof title !== "string" || title.trim() === "") {
        throw new ValidationError("Invalid title. Title must be a non-empty string.");
    }
    const task = {
        id: taskRepository.getNextId(),
        title,
        done: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    taskRepository.createTask(task);

    return task;
}

function updateTask(id, data) {
    const task = taskRepository.getTaskById(id);
    if (!task) {
        throw new NotFoundError(`Task ${id} not found`);
    }
    if (!data || Object.keys(data).length === 0) {
        throw new ValidationError("Body is missing");
    }
    if (data.title === undefined && data.done === undefined) {
        throw new ValidationError("body must contain at least one of 'title' or 'done'");
    }
    if (data.title !== undefined &&
        (typeof data.title !== "string" || data.title.trim() === "")
    ) {
        throw new ValidationError("Invalid title. Title must be a non-empty string.");
    }
    if (data.done !== undefined &&
        typeof data.done !== "boolean"
    ) {
        throw new ValidationError("'done' must be a boolean");
    }
    taskRepository.updateTask(id, data);

    return taskRepository.getTaskById(id);
}

function getTaskById(id) {
    const task = taskRepository.getTaskById(id);

    if (!task) {
        throw new NotFoundError(`Task ${id} not found`);
    }

    return task;
}

function deleteTask(id) {
    const task = taskRepository.getTaskById(id);

    if (!task) {
        throw new NotFoundError(`Task ${id} not found`);
    }

    taskRepository.deleteTask(id);
}

function getStats() {
    return taskRepository.getStats();
}

function resetTasks() {
    return taskRepository.resetTasks();
}

module.exports = {
    getAllTasks,
    createTask,
    updateTask,
    getTaskById,
    deleteTask,
    getStats,
    resetTasks
};