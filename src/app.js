require('dotenv').config();
const { testConnection } = require("./config/db");

const express = require('express');

const authRouter = require("./routes/auth");
const userRouter = require("./routes/users");
const projectRouter = require("./routes/projects");
const tasksRouter = require("./routes/tasks");

const app = express();

// 日志中间件
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.use(express.json());


app.use("/api/v1/auth", authRouter); 
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", tasksRouter); 

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

module.exports = app;