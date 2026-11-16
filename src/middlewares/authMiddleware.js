const jwt = require("jsonwebtoken");
const { verifyAccessToken } = require("../utils/tokens");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Not Provided Authentication Token' });
    }

    try {
        const decoded = jwt.verifyAccessToken(token);
        // 将解析出的 payload 挂载到 req 对象上 
        req.user = {
            userId: Number(decoded.sub),
            // role: decoded.role
        };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token Invalid or Expired' });
    }
}

module.exports = { 
    authMiddleware 
};