const { getDbConnection, loadSqlFile } = require("./db");

async function seed() {
    let connection;
    try {
        connection = await getDbConnection();
        console.log("Importing test data...");

        const schmeSql = await loadSqlFile("seed.sql");
        await connection.query(schmeSql);

        console.log("Seed data import completed");
    } catch (err) {
        console.error("Execution failed: ", err.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

seed();
