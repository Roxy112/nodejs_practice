// 创建Project
async function createProject(connection, project) {
    const { userId, name, description = null } = project;

    const [result] = await connection.execute(
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
async function findProjectsByUserId(connection, userId) {
    const [result] = await connection.execute(
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
async function findProjectByIdAndUserId(connection, id, userId) {
    const [result] = await connection.execute(
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
async function updateProject(connection, project) {
    const { id, userId, name, description = null } = project;

    const [result] = await connection.execute(
        `UPDATE \`project\` SET name = ?, description = ? WHERE id = ? AND user_id = ?;`,
        [name, description, id, userId]
    );

    if (result.affectedRows === 0) {
        const err = new Error("Project not found or unauthorized");
        err.status = 404;
        throw err;
    }

    return true;
}

// 删除项目
async function deleteProject(connection, id, userId) {
    const [result] = await connection.execute(
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

module.exports = {
    createProject,
    findProjectsByUserId,
    findProjectByIdAndUserId,
    updateProject,
    deleteProject
};
