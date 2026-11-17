const service = require("../services/userService");

const { userSchema, changePasswordSchema } = require("../schemas/user");

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
    const id = Number(req.user.userId);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid userId" });
    }

    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            error: validation.error.issues.map((issue) => ({
                path: issue.path.join(".") || "(root)",
                message: issue.message,
            })),
        });
    }

    try {
        const result = await service.updateUser(id, validation.data);
        return res.status(200).json({
            "success": true,
            "message": "OK",
            "data": {
                "user": result
            }
        });
    } catch (error) {
        next(error);
    }        
}

async function changePassword(req, res, next) {
    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            error: validation.error.issues.map((issue) => ({
                path: issue.path.join(".") || "(root)",
                message: issue.message,
            })),
        });
    }

    try {
        const { account, password } = validation.data;
        const result = await service.changePassword(account, password);
        return res.status(200).json({
            "success": true,
            "message": "OK",
            "data": {
                "user": result
            }
        });
    } catch (error) {
        next(error);
    }      
}

module.exports = {
    getUser,
    updateUser,
    changePassword
}