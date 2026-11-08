const projectRepository = require("../repositories/projectsRepository");
const taskRepository = require("../repositories/taskRepository");
const db = require("../config/db");

async function createProject(project) {
    const result = await projectRepository.createProject(project);
    return result;
}

async function findProjectsFromUser(userId) {
    const result = await projectRepository.findProjectsByUserId(userId);
    return result;
}

async function findProjectDetail(id, userId) {
    const result = await projectRepository.findProjectByIdAndUserId(id, userId);
    return result;
}

async function updateProject(project) {
    const result = await projectRepository.updateProject(project);
    return result;
}

async function DeleteProject(id, userId, cascade = false) {
    const connection = await db.pool.getConnection();
    let transactionStarted = false;
    try {
        await connection.beginTransaction();
        transactionStarted = true;

        const project = await projectRepository.LockProject(id, userId, connection);
        if (!project) {
            const error = new Error("Project not found or unauthorized");
            error.status = 404;
            throw error;
        }
        
        if (cascade === true) {
            await taskRepository.deleteTasksByProjectId(id, userId, connection);
        } else {
            const tasks = await taskRepository.findTasksByProjectIdAndUserId(
                id, userId, connection
            );
            if (tasks.length > 0) {
                const error = new Error("Project contains tasks");
                error.status = 409;
                throw error;
            }
        }

        await projectRepository.deleteProject(id, userId, connection);
        
        await connection.commit();
    } catch (error) {
        try {
            if (transactionStarted === true) {
                await connection.rollback();
            }
        } catch (e) {
            console.error("Rollback failed", e.message);
        }
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    createProject,
    findProjectsFromUser,
    findProjectDetail,
    updateProject,
    DeleteProject
};