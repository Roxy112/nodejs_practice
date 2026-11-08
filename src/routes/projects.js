const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const controller = require("../controllers/projectsController");

// 对该 router 下所有路由统一应用
router.use(authMiddleware);

router.post("/", controller.createProject);

router.get("/", controller.listProjects);

router.get("/:projectId", controller.getProject);

router.patch("/:projectId", controller.updateProject);

router.delete("/:projectId", controller.deleteProject);

module.exports = router;