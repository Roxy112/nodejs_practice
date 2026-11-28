const fs = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config({ path: path.resolve(__dirname, "../../.env.test"), override: true });

const TEST_DB_NAME = process.env.DB_NAME || "taskHub_test";
if (!TEST_DB_NAME.endsWith("_test")) {
    throw new Error(`Refusing to run tests on non-test database: ${TEST_DB_NAME}`);
}
process.env.DB_NAME = TEST_DB_NAME;

function getDbConfig() {
    return {
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "123456",
        database: TEST_DB_NAME,
        multipleStatements: true
    };
}

async function setupTestDb() {
    const config = getDbConfig();
    const rootConn = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password
    });

    try {
        await rootConn.query(
            `CREATE DATABASE IF NOT EXISTS \`${config.database}\`
             DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
        );
    } finally {
        await rootConn.end();
    }

    const conn = await mysql.createConnection(config);
    try {
        const schemaPath = path.resolve(__dirname, "../../scripts/schema.sql");
        const schemaSql = await fs.readFile(schemaPath, "utf8");
        await conn.query(schemaSql);
    } finally {
        await conn.end();
    }
}

async function cleanTestDb() {
    const { pool } = require("../../src/config/db");
    const conn = await pool.getConnection();
    try {
        await conn.query("SET FOREIGN_KEY_CHECKS = 0");
        await conn.query("TRUNCATE TABLE `task`");
        await conn.query("TRUNCATE TABLE `project`");
        await conn.query("TRUNCATE TABLE `user`");
        await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    } finally {
        conn.release();
    }
}

async function teardownTestDb() {
    const { pool } = require("../../src/config/db");
    await pool.end();
}

module.exports = {
    setupTestDb,
    cleanTestDb,
    teardownTestDb
};
