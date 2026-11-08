const db = require("../config/db");

// 创建Project
async function createProject(project, conn = null) {
    const executor = conn ?? db.pool;
    const { userId, name, description = null } = project;

    const [result] = await executor.execute(
        `INSERT INTO \`project\` (user_id, name, description) VALUES (?, ?, ?);`,
        [userId, name, description]
    );

    return {
        id: result.insertId,
        userId,
        name,
        description
    };
}

// 根据userID查找project
async function listByUser(userId, conn = null) {
    const executor = conn ?? db.pool;
    const [result] = await executor.execute(
        `SELECT 
            id, 
            name, 
            description, 
            created_at 
        FROM \`project\` WHERE user_id = ?;`,
        [userId]
    );

    return result;
}

// 根据projectId和userId查找project
async function findOwnedById(id, userId, conn = null) {
    const executor = conn ?? db.pool;
    const [result] = await executor.execute(
        `SELECT 
            id, 
            name, 
            description, 
            created_at 
        FROM \`project\` WHERE id = ? AND user_id = ?;`,
        [id, userId]
    );

    return result[0] ?? null;
}

// 修改项目信息
async function updateProject(project, conn = null) {
    const executor = conn ?? db.pool;
    const { id, userId, name, description = null } = project;

    let result;
    if (description === null) {
        [result] = await executor.execute(
            `UPDATE \`project\` SET name = ?, description = ? WHERE id = ? AND user_id = ?;`,
            [name, description, id, userId]
        );
    } else {
        [result] = await executor.execute(
            `UPDATE \`project\` SET name = ? WHERE id = ? AND user_id = ?;`,
            [name, id, userId]
        );
    }

    if (result.affectedRows === 0) {
        const err = new Error("Project not found or unauthorized");
        err.status = 404;
        throw err;
    }

    return true;
}

// 删除项目
async function deleteProject(id, userId, conn = null) {
    const executor = conn ?? db.pool;
    const [result] = await executor.execute(
        `DELETE FROM \`project\` WHERE id = ? AND user_id = ?;`,
        [id, userId]
    );

    if (result.affectedRows === 0) {
        const err = new Error("Project not found or unauthorized");
        err.status = 404;
        throw err;
    }

    return true;
}

async function lockProject(id, userId, conn = null) {
    const executor = conn ?? db.pool;
    const [result] = await executor.execute(
        `SELECT id FROM \`project\` WHERE id = ? AND user_id = ? FOR UPDATE;`,
        [id, userId]
    );

    return result[0] ?? null;
}

module.exports = {
    createProject,
    listByUser,
    findOwnedById,
    updateProject,
    deleteProject,
    lockProject
};
