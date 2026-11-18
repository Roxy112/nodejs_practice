const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const projectController = require("../controllers/projectsController");
const tasksController = require("../controllers/tasksController");

router.use(authMiddleware);

router.post("/", projectController.createProject);

router.get("/", projectController.listProjects);

router.get("/:projectId", projectController.getProject);

router.patch("/:projectId", projectController.updateProject);

router.delete("/:projectId", projectController.deleteProject);


router.post("/:projectId/tasks", tasksController.createTask);

// router.get("/:projectId/tasks", tasksController.listTasks);

module.exports = router;