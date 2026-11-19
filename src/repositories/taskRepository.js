const db = require("../config/db");

async function createTask(projectId, userId, task, conn = null) {
    const executor = conn ?? db.pool;
    const { name, description = null, priority = "medium", deadline = null } = task;

    const status = "pending";
    const dbDeadline = deadline === null
    ? null
    : new Date(deadline).toISOString().slice(0, 19).replace("T", " ");

    const [result] = await executor.execute(
        `INSERT INTO \`task\` (
            \`project_id\`, 
            \`name\`, 
            \`description\`, 
            \`priority\`, 
            \`deadline\`,
            \`status\`) 
        SELECT id, ?, ?, ?, ?, ?
        FROM \`project\`
        WHERE id = ? AND user_id = ?;`,
        [name, description, priority, dbDeadline, status, projectId, userId]
    );

    if (result.affectedRows === 0) {
        const err = new Error("Project not found or unauthorized to add tasks");
        err.status = 404; 
        throw err;
    }

    return {
        id: result.insertId,
        projectId,
        name,
        description,
        status,
        priority,
        deadline: dbDeadline
    }
}

// 根据projectId和userId查找task
async function listOwnedByProject(projectId, userId, conn = null) {
    const executor = conn ?? db.pool;
    const [result] = await executor.execute(
        `SELECT 
            t.id, 
            t.name, 
            t.description, 
            t.status, 
            t.priority, 
            t.deadline 
        FROM \`task\` t
        INNER JOIN \`project\` p ON t.project_id = p.id
        WHERE t.project_id = ? AND p.user_id = ?
        ORDER BY t.id ASC;`,
        [projectId, userId]
    )
    return result;
}

// 根据taskId和userId查找task
async function getTask(id, userId, conn = null) {
    const executor = conn ?? db.pool;
    const [result] = await executor.execute(
        `SELECT 
            t.id,
            t.project_id AS projectId,
            p.name AS projectName,
            t.name,
            t.description,
            t.status,
            t.priority,
            t.deadline,
            t.created_at AS createdAt,
            t.updated_at AS updatedAt
        FROM \`task\` t
        INNER JOIN \`project\` p ON t.project_id = p.id
        WHERE t.id = ? AND p.user_id = ?;`,
        [id, userId]
    );

    return result[0] ?? null;
}

const ALLOWED_COLUMNS = new Set(["name", "description", "status", "priority", "deadline"]);
async function updateTask(id, userId, task, conn = null) {
    const executor = conn ?? db.pool;

    if (!task || typeof task !== "object" || Array.isArray(task)) {
        const err = new Error("Invalid task data");
        err.status = 400;
        throw err;
    }
    
    const keys = Object.keys(task || {}).filter(
        key => ALLOWED_COLUMNS.has(key) && 
        task[key] !== undefined
    );
    if (keys.length === 0) {
        const err = new Error("Empty request");
        err.status = 400;
        throw err;
    }

    const setClauses = keys.map((key) => `t.\`${key}\` = ?`).join(', ');

    const values = keys.map((key) => {
        const value = task[key];
        if (key === "deadline" && value !== null) {
            return new Date(value).toISOString().slice(0, 19).replace("T", " ");
        }
        return value;
    });

    values.push(id, userId);
    const query = `
        UPDATE \`task\` t
        INNER JOIN \`project\` p ON t.project_id = p.id
        SET ${setClauses}
        WHERE t.id = ? AND p.user_id = ?;`;

    const [result] = await executor.execute(query, values);

    if (result.affectedRows === 0) {
        const err = new Error("Task not found or unauthorized");
        err.status = 404;
        throw err;
    }

    return await getTask(id, userId, conn);
}

async function deleteTask(id, projectId, userId, conn = null) {
    const executor = conn ?? db.pool;
    const [result] = await executor.execute(
        `DELETE FROM \`task\` 
         WHERE id = ? 
         AND project_id = (SELECT id FROM \`project\` WHERE id = ? AND user_id = ?)`,
        [id, projectId, userId]
    );

    if (result.affectedRows === 0) {
        const err = new Error("Task not found or unauthorized");
        err.status = 404;
        throw err;
    }

    return true;
}

async function lockTask(id, projectId, userId, conn = null) {
    const executor = conn ?? db.pool;
    const [result] = await executor.execute(
        `SELECT id FROM \`task\` 
         WHERE id = ? 
            AND project_id = (SELECT id FROM \`project\` WHERE id = ? AND user_id = ?)
         FOR UPDATE;`,
        [id, projectId, userId]
    );

    return result[0] ?? null;
}

async function deleteAllByProject(projectId, userId, conn = null) {
    const executor = conn ?? db.pool;
    await executor.execute(
        `DELETE FROM \`task\`
        WHERE project_id = (
        SELECT id FROM \`project\` WHERE id = ? AND user_id = ?
        )`,
        [projectId, userId]
    );
}

module.exports = {
    createTask,
    listOwnedByProject,
    getTask,
    updateTask,
    deleteTask,
    lockTask,
    deleteAllByProject
};