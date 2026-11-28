const app = require("./app");

async function start() {
    try {
        await testConnection();
        const port = Number(process.env.PORT) || 3000;
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Database Connect Failed", err);
        process.exit(1);
    }
}

start();