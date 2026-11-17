const db = require("../config/db");

async function createUser(user, conn = null) {
    const executor = conn ?? db.pool;
    const { name, account, password_hash } = user;
    
    const [result] = await executor.execute(
        `INSERT INTO \`user\` 
            (name, account, password_hash) 
        VALUES 
            (?, ?, ?);`,
        [name, account, password_hash]
    );
    
    return {
        id: result.insertId,
        name,
        account,
        password_hash,
    };
}

async function getUserByAccount(account, conn = null) {
    const executor = conn ?? db.pool;
        const [result] = await executor.execute(
            `SELECT id, name, account, password_hash, created_at 
            FROM \`user\` WHERE account = ?;`,
            [account]
        );
    
        return result[0] ?? null;
}

async function getUserById(id, conn = null) {
    const executor = conn ?? db.pool;
    const [result] = await executor.execute(
        `SELECT id, name, account, created_at 
        FROM \`user\` WHERE id = ?;`,
        [id]
    );
    
    return result[0] ?? null;
}

const ALLOWED_COLUMNS = new Set(["name", "account"]);

async function updateUser(id, user, conn = null) {
    if (!user || id == null) {
        const err = new Error("Invalid user data or missing id");
        err.status = 400;
        throw err;
    }

    const executor = conn ?? db.pool;

    const keys = Object.keys(user || {}).filter(
        key => ALLOWED_COLUMNS.has(key) && 
        user[key] !== undefined && 
        user[key] !== null
    );
    if (keys.length === 0) {
        const err = new Error("Empty request");
        err.status = 400;
        throw err;
    }

    const setClauses = keys.map((key) => `\`${key}\` = ?`).join(', ');

    const values = [...keys.map(key => user[key]), id];
    const query = `
        UPDATE \`user\`
        SET ${setClauses}
        WHERE id = ?;`;

    const [result] = await executor.execute(query, values);

    if (result.affectedRows === 0) {
        const err = new Error("Project not found or unauthorized");
        err.status = 404;
        throw err;
    }
    const { name, account } = await getUserById(id, conn);
    return { id, name, account };
}

async function changePassword(account, password_hash, conn = null) {
    const executor = conn ?? db.pool;

    const [result] = await executor.execute(
        `UPDATE \`user\`
        SET password_hash = ? 
        WHERE account = ?;`,
        [password_hash, account]
    );

    return result[0] ?? null;
}

module.exports = {
    createUser,
    getUserByAccount,
    getUserById,
    updateUser,
    changePassword
};