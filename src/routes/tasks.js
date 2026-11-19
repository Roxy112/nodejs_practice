const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const controller = require("../controllers/tasksController");

router.use(authMiddleware);

router.get("/:taskId", controller.getTask);

router.patch("/:taskId", controller.updateTask);

module.exports = router;