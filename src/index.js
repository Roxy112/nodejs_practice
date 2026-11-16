require('dotenv').config();
const { testConnection } = require("./config/db");

const express = require('express');

const authRouter = require("./routes/auth");
const projectsRouter = require("./routes/projects");
const tasksRouter = require("./routes/tasks");

const app = express();

// 日志中间件
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.use(express.json());


app.use("/api/v1/auth", authRouter); 
app.use("/api/v1/projects", projectsRouter);
// app.use("/api/v1/tasks", tasksRouter); 

app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
    });
});

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