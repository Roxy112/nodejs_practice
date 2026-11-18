const service = require("../services/tasksServices");

const { createTaskSchema } = require("../schemas/task");

async function createTask(req, res, next) {
    const userId = Number(req.user.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: "Invalid userId" });
    }
    const projectId = Number(req.params);
    if (!Number.isInteger(projectId) || projectId <= 0) {
        return res.status(400).json({ error: "Invalid projectId" });
    }

    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            error: validation.error.issues.map((issue) => ({
                path: issue.path.join(".") || "(root)",
                message: issue.message,
            })),
        });
    }

    try {
        const result = await service.createTask(userId, projectId, validation.data);
        return res.status(201).json({
            "success": true,
            "message": "Created",
            "data": {
                "id": result.id,
                "name": result.name,
                "description": result.description ?? null,
                "priority": result.priority,
                "deadline": result.deadline
            }
        });
    } catch (error) {
        next(error);
    }    
}

// async function listTasks(req, res, next) {
//     const userId = Number(req.user.userId);
//     if (!Number.isInteger(userId) || userId <= 0) {
//         return res.status(400).json({ error: "Invalid userId" });
//     }
// }

module.exports = {
    createTask,
    listTasks
}