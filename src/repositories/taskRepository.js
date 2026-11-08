const db = require("../config/db");

// 创建Task
async function createTask(task, userId, conn = null) {
    const executor = conn ?? db.pool;
    const { projectId, name, description = null, status, priority, deadline = null } = task;
    const [result] = await executor.execute(
        `INSERT \`task\` (
            \`project_id\`, 
            \`name\`, 
            \`description\`, 
            \`status\`, 
            \`priority\`, 
            \`deadline\`) 
        SELECT id, ?, ?, ?, ?, ?
        FROM \`project\`
        WHERE id = ? AND user_id = ?;`,
        [name, description, status, priority, deadline, projectId, userId]
    );

    if (result.affectedRows === 0) {
        const err = new Error("Project not found or unauthorized to add tasks");
        err.status = 403; // 或 404
        throw err;
    }

    return {
        id: result.insertId,
        projectId,
        name,
        description,
        status,
        priority,
        deadline
    }
}

// 根据projectId和userId查找task
async function findTasksByProjectIdAndUserId(projectId, userId, conn = null) {
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
        WHERE t.project_id = ? AND p.user_id = ?;`,
        [projectId, userId]
    )
    return result;
}

// 根据taskId和userId查找task
async function findTaskDetailById(id, userId, conn = null) {
    const executor = conn ?? db.pool;
    const [result] = await executor.execute(
        `SELECT 
            t.id,
            t.project_id AS projectId,
            p.name AS projectName,
            t.name,
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

// 修改task
async function updateTask(task, userId, conn = null) {
    const executor = conn ?? db.pool;
    const { id, projectId, name, description = null, status, priority, deadline = null } = task;
    if (!id || !projectId || !name || !status || !priority) {
        const err = new Error("Missing required task fields");
        err.status = 400;
        throw err;
    }
    const [result] = await executor.execute(
        `UPDATE \`task\` t
         INNER JOIN \`project\` p ON t.project_id = p.id
         SET
            t.name = ?,
            t.description = ?,
            t.status = ?,
            t.priority = ?,
            t.deadline = ?
         WHERE t.id = ? AND t.project_id = ? AND p.user_id = ?;`,
        [name, description, status, priority, deadline, id, projectId, userId]
    );
    
    if (result.affectedRows === 0) {
        const err = new Error("Task not found or unauthorized");
        err.status = 404;
        throw err;
    }

    return true;
}

// 删除task
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

async function LockTask(id, projectId, userId, conn = null) {
    const executor = conn ?? db.pool;
    const [result] = await executor.execute(
        `SELECT t.id FROM \`task\` t 
         INNER JOIN \`project\` p ON t.project_id = p.id 
         WHERE t.id = ? AND p.user_id = ? FOR UPDATE;`,
        [id, projectId, userId]
    );

    return result[0] ?? null;
}

module.exports = {
    createTask,
    findTasksByProjectIdAndUserId,
    findTaskDetailById,
    updateTask,
    deleteTask,
    LockTask
};