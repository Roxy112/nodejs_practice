const service = require("../services/userService");

async function getUser(req, res, next) {
    const id = Number(req.user.userId);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid userId" });
    }

    try {
        const result = await service.getUser(id);
        return res.status(200).json({
            "success": true,
            "data": {
                "id": result.id,
                "name": result.name,
                "account": result.account,
                "created_at":result.created_at
            }
        });
    } catch (error) {
        next(error);
    }    
}

async function updateUser(req, res, next) {
    
}

async function changePassword(req, res, next) {
    
}

module.exports = {
    getUser,
    updateUser,
    changePassword
}