async function createProject(connection, userId, name) {
    const [result] = await connection.execute(
        "INSERT INTO `project` (`user_id`, `name`) VALUES (?, ?);",
        [userId, name]
    );

    return {
        id: result.insertId,
        userId,
        name
    };
}

async function findProjectByUserId(connection, userId) {
    const [rows] = await connection.execute(
        "SELECT id, name, description, created_at FROM `project` WHERE user_id = ?;",
        [userId]
    );

    return rows;
}

async function findProjectByIdAndUserId(connection, projectId, userId) {
    const [rows] = await connection.execute(
        "SELECT id, name, description, created_at FROM `project` WHERE id = ? AND user_id = ?;",
        [projectId, userId]
    );

    return rows[0] ?? null;
}