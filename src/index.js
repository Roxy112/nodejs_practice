require('dotenv').config();
const { testConnection } = require("./config/db");

const express = require('express');
const jwt = require("jsonwebtoken");

// const authRouter = require("./routes/auth");
const projectsRouter = require("./routes/projects");
// const tasksRouter = require("./routes/tasks");

// const { authMiddleware } = require("./middlewares/authMiddleware");

const app = express();

// 日志中间件
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.use(express.json());

// // 服务端密钥
// const JWT_SECRET = process.env.JWT_SECRET;

// // 登录接口：签发 Token
// app.post('/api/login', (req, res) => {
//     const { username, password } = req.body;

//     // 1. 模拟校验用户名和密码
//     if (username !== 'admin' || password !== '123456') {
//         return res.status(404).json({ message: '账号或密码错误' });
//     }

//     // 2. 定义载荷数据
//     const payload = {
//         userId: 101,
//         username: 'admin',
//         role: 'manager'
//     };

//     // 3. 生成 Token，设置有效时间为 2 小时
//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

//     // 4. 返回给前端
//     res.json({
//         message: '登录成功',
//         token: token
//     });
// });

app.use("/api/v1/auth", authRouter); 
// app.use("/api/v1/users", authRouter);  TODO
app.use("/api/v1/projects", projectsRouter);
// app.use("/api/v1/tasks", tasksRouter);  TODO

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