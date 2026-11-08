const express = require('express');
const jwt = require("jsonwebtoken");

// const authRouter = require("./routes/auth");
const projectsRouter = require("./routes/projects");
// const tasksRouter = require("./routes/tasks");

const app = express();

// 日志中间件
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.use(express.json());

// 服务端密钥
const JWT_SECRET = process.env.JWT_SECRET;

// 登录接口：签发 Token
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // 1. 模拟校验用户名和密码
    if (username !== 'admin' || password !== '123456') {
        return res.status(401).json({ message: '账号或密码错误' });
    }

    // 2. 定义载荷数据
    const payload = {
        userId: 101,
        username: 'admin',
        role: 'manager'
    };

    // 3. 生成 Token，设置有效时间为 2 小时
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    // 4. 返回给前端
    res.json({
        message: '登录成功',
        token: token
    });
});

// 验证中间件：拦截需要认证的路由
function authenticateToken(req, res, next) {
    // 从 Authorization 请求头获取格式为 "Bearer <token>" 的字符串
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '缺少访问令牌' });
    }

    // 校验 Token
    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
        // Token 过期或被篡改
        return res.status(403).json({ message: '令牌无效或已过期' });
        }

        // 验证通过，将解码出的用户信息绑定到 req 上，方便后续接口使用
        req.user = decodedUser;
        next();
    });
}

// 受保护的接口：需要携带有效 Token
app.get('/api/profile', authenticateToken, (req, res) => {
    // 直接从 req.user 读取在中间件中解析出的信息
    res.json({
        message: '获取成功',
        currentUser: req.user
    });
});

// app.use("/auth", authRouter);  TODO
// app.use("/users", authRouter);  TODO
app.use("/projects", projectsRouter);
// app.use("/tasks", tasksRouter);  TODO

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

app.listen(3000, () => console.log('Server running on port 3000'));