const fs = require("fs/promises");
const path = require("path");
const mysql = require("mysql2/promise");

require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'taskHub',
    multipleStatements: true
};

async function loadSqlFile(fileName) {
    const filePath = path.join(__dirname, fileName);
    return await fs.readFile(filePath, "utf8");
}

async function getDbConnection() {
    const rootConn = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password
    });
    await rootConn.query(
        `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` 
        DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await rootConn.end();

    return await mysql.createConnection(dbConfig);
}

module.exports = {
    loadSqlFile,
    getDbConnection
}