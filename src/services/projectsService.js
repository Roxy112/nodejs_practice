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

async function cascadeDeleteProject(id, userId) {
    // 获取待删除的task的id
    const tasks = await taskRepository.findTasksByProjectIdAndUserId(id, userId);
    let tasksId = [];
    for (const task of tasks) {
        tasksId.push(task.id);
    }

    const connection = await db.pool.getConnection();
    let transactionStarted = false;
    try {
        await connection.beginTransaction();
        transactionStarted = true;

        for (const taskId of tasksId) {
            await taskRepository.LockTask(taskId, id, userId, connection);
            await taskRepository.deleteTask(taskId, id, userId, connection);
        }

        await projectRepository.LockPtoject(id, userId, connection);
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
    cascadeDeleteProject
};