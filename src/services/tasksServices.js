const db = require("../config/db");
const tasksRepository = require("../repositories/taskRepository");
const projectsRepository = require("../repositories/projectsRepository");

async function createTask(userId, projectId, task) {
    const checkProject = await projectsRepository.findOwnedById(projectId, userId);
    if (checkProject === null) {
        const error = new Error("Project not found or unauthorized");
        error.status = 404;
        throw error;
    }

    const result = await tasksRepository.createTask(projectId, userId, task);
    return result;
}

async function listTasks(projectId, userId) {
    const checkProject = await projectsRepository.findOwnedById(projectId, userId);
    if (checkProject === null) {
        const error = new Error("Project not found or unauthorized");
        error.status = 404;
        throw error;
    }

    const tasks = await tasksRepository.listOwnedByProject(projectId, userId);
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
    const result = await tasksRepository.getTask(id, userId);
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

async function updateTask(id, userId, task) {
    const checkTask = await tasksRepository.getTask(id, userId);
    if (checkTask === null) {
        const error = new Error("Task not found or unauthorized");
        error.status = 404;
        throw error;
    }

    const result = await tasksRepository.updateTask(id, userId, task);
    return result;
}

async function deleteTask(id, userId) {
    const task = await tasksRepository.getTask(id, userId);
    if (task === null) {
        const error = new Error("Task not found or unauthorized");
        error.status = 404;
        throw error;
    }
    const projectId = task.projectId;

    const result = await tasksRepository.deleteTask(id, projectId, userId)
    return result;
}

module.exports = {
    createTask, 
    listTasks,
    getTask,
    updateTask,
    deleteTask
};