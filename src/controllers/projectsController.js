const service = require("../services/projectsService");

const z = require("zod");

function isValidId(id) {
    if (!Number.isInteger(id) || id <= 0) return false;
    return true;
}

/* function validateString(value, opt = {}) {
    const { required = true, min = 0, max = Infinity, trim = true } = opt;
    if (value === undefined || value === null) {
        if (required) return { ok: false, msg: "The string cannot be empty" };
        return { ok: true, value: "" };
    }
    if (typeof value !== "string") {
        return { ok: false, msg: "Must be a string" };
    }

    const v = trim ? value.trim() : value;

    if (v.length === 0) {
        if (required) return { ok: false, msg: "The string cannot be empty" };
        return { ok: true, value: v };
    }

    const len = [...v].length; 
    if (len < min) return { ok: false, msg: `Length must be at least than ${min}` };
    if (len > max) return { ok: false, msg: `Length must be at most than ${max}` };

    return { ok: true, value: v };
} */

const createProjectSchema = z
    .object({
        name: z.string().min(1, "The string cannot be empty").max(20), 
        description: z.string().min().max(50).nullable(),
    })
    .strict();


async function createProject(req, res, next) {
    const userId = req.user.userId;

    if (!isValidId(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
    }
    const validation = createProjectSchema.safeParse(req.body);
    if (!validation.success) {
    return res.status(400).json({
      error: validation.error.issues.map((issue) => ({
        path: issue.path.join(".") || "(root)",
        message: issue.message,
      })),
    });
  }

    try {
        const result = await service.createProject(userId, validation.data);
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

const updateProjectSchema = z
        .object({
            name: z.string().min(1, "The String cannot be empty").max(20),
            description: z.string().min(0).max(50).nullable()
        })
        .partial()
        .strict()
        .refine((data) => Object.keys(data).length > 0, {
            message: "No fields provided to update",
        });

async function updateProject(req, res, next) {
    const projectId = Number( req.params.projectId );
    const userId = Number(req.user?.userId);

    if (!isValidId(projectId) || isValidId(userId)) {
        return res.status(400).json({ error: "Invalid projectId" });
    }
    
    const validation = updateProjectSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            error: validation.error.issues.map((issue) => ({
                path: issue.path.join(".") || "(root)",
                message: issue.message,
            })),
        });
    }

    try {
        const result = await service.updateProject(projectId, userId, validation.data);
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
        return res.status(204).end();
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