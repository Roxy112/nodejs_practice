const { getDbConnection, loadSqlFile } = require("./db");

async function init() {
    let connection;
    try {
        connection = await getDbConnection();
        console.log("Checking and initializing table structure...");

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

init();
