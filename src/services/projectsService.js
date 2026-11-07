const repository = require("../repositories/projectsRepository");

async function createProject(project) {
    const result = await repository.createProject(project);
    return result;
}

async function findProjectsFromUser(userId) {
    const result = await repository.findProjectsByUserId(userId);
    return result;
}

async function findProjectDetail(id, userId) {
    const result = await repository.findProjectByIdAndUserId(id, userId);
    return result;
}

async function updateProject(project) {
    const result = await repository.updateProject(project);
    return result;
}

async function deleteProject(id, userId) {
    const result = await repository.deleteProject(id, userId);
    return result;
}

module.exports = {
    createProject,
    findProjectsFromUser,
    findProjectDetail,
    updateProject,
    deleteProject
};