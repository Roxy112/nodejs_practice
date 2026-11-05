const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',

  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

async function testConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.ping();
        console.log("Database Connection Create Success");
    } finally {
        if(connection) connection.release();
    }
}

module.exports = { pool, testConnection };