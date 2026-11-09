const service = require("../services/projectsService");

function isValidId(id) {
    if (!Number.isInteger(id) || id <= 0) return false;
    return true;
}

async function createProject(req, res, next) {
    const { name, description = null} = req.body;
    const userId = req.user.userId;
    if (!name || !isValidId(userId)) {
        return res.status(400).json({ error: "Bad Request" });
    }
    const project = {
        name,
        description,
        userId
    }

    try {
        const result = await service.createProject(project);
        return res.status(201).json({
            "success": true,
            "message": "Created",
            "data": {
                "id": result.id,
                "name": result.name
            }
        });
    } catch (error) {
        next(error);
    }
}

async function listProjects(req, res, next) {
    const userId = req.user.userId;
    if (!isValidId(userId)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    try {
        const result = await service.listProjects(userId);
        return res.status(200).json({
            "success": true,
            "message": "OK",
            "data": {
                "project": result 
            }
        });
    } catch (error) {
        next(error);
    }
}

async function getProject(req, res, next) {
    const id = Number(req.params.projectId);
    const userId = Number(req.user.userId);
    if (!isValidId(id) || !isValidId(userId)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    try {
        const result = await service.getProject(id, userId);
        if (result === null) {
            return res.status(404).json({ error: "Not Found or unauthorized" });
        }
        return res.status(200).json({
            "success": true,
            "message": "OK",
            "data": {
                "project": result 
            }
        });
    } catch (error) {
        next(error);
    }
}

async function updateProject(req, res, next) {
    const projectId = Number( req.params.id );
    const { name, description = null } = req.body ?? {};
    const userId = Number(req.user.userId);
    if (!isValidId(projectId) ||
        !isValidId(userId) || 
        !name
    ) {
        return res.status(400).json({ error: "Bad Request" });
    }

    const project = {
        id: projectId,
        name,
        description,
        userId
    }

    try {
        const result = await service.updateProject(project);
        return res.status(200).json({
            "success": true,
            "message": "OK",
            "data": {
                "project": result 
            }
        });
    } catch (error) {
        next(error);
    }
    
}

async function deleteProject(req, res, next) {
    const id = Number(req.params.projectId);
    const userId = Number(req.user.userId);
    if (!isValidId(id) || !isValidId(userId)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    const value = req.query.cascade;
    if (value !== undefined && value !== "true" && value !== "false") {
        return res.status(400).json({ error: "cascade must be true or false" });
    }
    const cascade = value === "true";

    try {
        await service.deleteProject(id, userId, cascade);
        return res.status(204);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createProject, 
    listProjects,
    getProject, 
    updateProject,
    deleteProject
};