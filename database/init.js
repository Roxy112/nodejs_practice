const path = require('path');
const fs = require('fs/promises');
const mysql = require('mysql2/promise');

// 1. 加载根目录 .env 环境变量
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true // 允许单次查询执行多条 SQL 语句
};

const dbName = process.env.DB_NAME || 'taskHub';

async function initDatabase() {
  let connection;

  try {
    console.log('[1/4] Connecting to MySQL server...');
    // 先不指定具体 database, 确保数据库不存在时可自动创建
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server successfully.');

    console.log(`[2/4] Ensuring database [${dbName}] exists...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`Switched to database: ${dbName}`);

    console.log('[3/4] Reading and executing schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf-8');
    await connection.query(schemaSql);
    console.log('Database schema initialized successfully (user, project, task).');

    console.log('[4/4] Reading and executing seed.sql...');
    const seedPath = path.join(__dirname, 'seed.sql');
    try {
      const seedSql = await fs.readFile(seedPath, 'utf-8');
      await connection.query(seedSql);
      console.log('Seed data imported successfully.');
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('seed.sql not found, skipping seed data insertion.');
      } else {
        throw err;
      }
    }

    console.log('\n========================================');
    console.log('Database initialization completed successfully!');
    console.log('========================================');
  } catch (error) {
    console.error('\nDatabase initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

initDatabase();
