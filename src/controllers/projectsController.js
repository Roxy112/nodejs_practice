const { deleteProject } = require("../repositories/projectsRepository");
const service = require("../services/projectsService");

function checkIdValidity(id) {
    if (!Number.isInteger(id) || id <= 0) return false;
    return true;
}

async function createProject(req, res, next) {
    const name = req.query.name;
    const description = req.query.description ?? null;
    const userId = req.user.userId;
    if (!name ||!checkIdValidity(userId)) {
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
            "message": "Create completed",
            "data": {
                "id": result.id,
                "name": result.name
            }
        });
    } catch (error) {
        next(error);
    }
}

async function findProjectsFromUser(req, res, next) {
    const userId = req.user.userId;
    if (!checkIdValidity(userId)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    try {
        const result = await service.findProjectsFromUser(userId);
        return res.status(201).json({
            "success": true,
            "message": "Find out",
            "data": {
                "project": result 
            }
        });
    } catch (error) {
        next(error);
    }
}

async function findProjectDetail(req, res, next) {
    const id = req.body.id;
    const userId = req.user.userId;
    if (!checkIdValidity(id) || !checkIdValidity(userId)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    try {
        const result = await service.findProjectDetail(id, userId);
        return res.status(201).json({
            "success": true,
            "message": "Find out",
            "data": {
                "project": result 
            }
        });
    } catch (error) {
        next(error);
    }
}

async function updateProject(req, res, next) {
    const { id, name, description = null} = req.body ?? {};
    const userId = req.user.userId
    if (!checkIdValidity(id) ||
        !checkIdValidity(userId) || 
        !name
    ) {
        return res.status(400).json({ error: "Bad Request" });
    }

    const project = {
        id,
        name,
        description,
        userId
    }

    try {
        const result = await service.updateProject(project);
        return res.status(201).json({
            "success": true,
            "message": "Delete completed",
            "data": {
                "project": result 
            }
        });
    } catch (error) {
        next(error);
    }
    
}

async function deleteProject(req, res, next) {
    const id = req.body.id;
    const userId = req.user.userId;
    if (!checkIdValidity(id) || !checkIdValidity(userId)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    try {
        const result = await service.deleteProject(id, userId);
        return res.status(201).json({
            "success": true,
            "message": "Delete completed",
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createProject, 
    findProjectsFromUser,
    findProjectDetail, 
    updateProject,
    deleteProject
};