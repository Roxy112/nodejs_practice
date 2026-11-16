const { verifyAccessToken } = require("../utils/tokens");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
        if (!authHeader) {
        return res.status(401).json({
            message: "Not Provided Authentication Token"
        });
    }

    const match = /^Bearer +(\S+)$/i.exec(authHeader);

    if (!match) {
        return res.status(401).json({
            message: "Authorization must use Bearer <token>"
        });
    }

    const token = match[1];

    if (!token) {
        return res.status(401).json({ message: 'Not Provided Authentication Token' });
    }

    try {
        const decoded = verifyAccessToken(token);
        const userId = Number(decoded.sub);
        if (!Number.isInteger(userId) || userId <= 0) throw new Error('Invalid userId in token');
        req.user = {
            userId,
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