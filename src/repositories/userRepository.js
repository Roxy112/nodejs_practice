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

module.exports = {
    createUser,
    getUser,
};