const db = require("../config/db");
const repository = require("../repositories/taskRepository");
const { findOwnedById } = require("../repositories/projectsRepository");

async function createTask(userId, projectId, task) {
    const checkProject = await findOwnedById(projectId, userId);
    if (checkProject === null) {
        const error = new Error("Project not found or unauthorized");
        error.status = 404;
        throw error;
    }

    const result = await repository.createTask(projectId, userId, task);
    return result;
}

async function listTasks(projectId, userId) {
    const checkProject = await findOwnedById(projectId, userId);
    if (checkProject === null) {
        const error = new Error("Project not found or unauthorized");
        error.status = 404;
        throw error;
    }

    const tasks = await repository.listOwnedByProject(projectId, userId);
    const result = tasks.map(task => ({
        "id": task.id,
        projectId,
        "name": task.name,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "deadline": task.deadline
    }));
    return result; 
}

async function getTask(id, userId) {
    const result = await repository.getTask(id, userId);
    if (result === null) {
        const error = new Error("Task not found or unauthorized");
        error.status = 404;
        throw error;
    }
    
    return {
        "id": result.id,
        "projectId": result.projectId,
        "projectName": result.projectName,
        "name": result.name,
        "description": result.description,
        "status": result.status,
        "priority": result.priority,
        "deadline": result.deadline,
        "createdAt": result.createdAt,
        "updatedAt": result.updatedAt
    };
}

// async function updateTask(task, userId) {
//     const result = await repository.updateTask(task, userId);
//     return result;
// }

// async function deleteTask(id, projectId, userId) {
//     const result = await repository.deleteTask(id, projectId, userId)
//     return result;
// }

module.exports = {
    createTask, 
    listTasks,
    getTask,
    // updateTask,
    // deleteTask
};