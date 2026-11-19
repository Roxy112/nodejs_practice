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

// async function findTasksFromProject(projectId, userId) {
//     const result = await repository.listOwnedByProject(projectId, userId);
//     return result; 
// }

// async function findTaskDetail(id, userId) {
//     const result = await repository.findOwnedById(id, userId);
//     return result;
// }

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
    // findTasksFromProject,
    // findTaskDetail,
    // updateTask,
    // deleteTask
};