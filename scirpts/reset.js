const { getDbConnection, loadSqlFile } = require("./db");

async function reset() {
    let connection;
    try {
        connection = await getDbConnection();
        console.log("Cleaning old tables and resetting the database...");

        const dropSql = `
            SET FOREIGN_KEY_CHECKS = 0;
            DROP TABLE IF EXISTS \`task\`;
            DROP TABLE IF EXISTS \`project\`;
            DROP TABLE IF EXISTS \`user\`;
            SET FOREIGN_KEY_CHECKS = 1;
        `;
        await connection.query(dropSql);

        const schmeSql = await loadSqlFile("schema.sql");
        await connection.query(schmeSql);

        console.log("Database table structure is ready");
    } catch (err) {
        console.error("Execution failed: ", err.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

reset();