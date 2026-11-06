const db = require("../config/db");
const repository = require("../repositories/taskRepository");

async function Authentication(projectId, userId) {
    // TODO
}

async function createTask(task, userId) {
    const result = await repository.createTask(task, userId);
    return result;
}
async function findTasksFromProject(projectId, userId) {
    const result = await repository.findTasksByProjectIdAndUserId(projectId, userId);
    return result; 
}

async function findTaskDetail(id, user_id) {
    const result = await repository.findTaskDetailById(id, user_id);
    return result;
}

async function updateTask(task, userId) {
    const result = await repository.updateTask(task, userId);
    return result;
}

async function deleteTask(id, projectId, userId) {
    const result = await repository.deleteTask(id, projectId, userId)
    return result;
}

module.exports = {
    createTask, 
    findTasksFromProject,
    findTaskDetail,
    updateTask,
    deleteTask
};