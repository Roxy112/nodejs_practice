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

async function getUser(account, conn = null) {
    const executor = conn ?? db.pool;
        const [result] = await executor.execute(
            `SELECT id, name, account, password_hash 
            FROM \`user\` WHERE account = ?;`,
            [account]
        );
    
        return result[0] ?? null;
}

const ALLOWED_COLUMNS = new Set(["name", "account"]);

async function updateUser(user, conn = null) {
    if (!user || user.id == null) {
        const err = new Error("Invalid user data or missing id");
        err.status = 400;
        throw err;
    }

    const executor = conn ?? db.pool;
    const { id } = user;

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

    const setClauses = keys.map((key, index) => `\`${key}\` = ?`).join(', ');

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

    return getUser(id, conn);
}

async function changePassword(user, conn = null) {
    
}

module.exports = {
    createUser,
    getUser,
    updateUser,
    changePassword
};