const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const controller = require("../controllers/userController");

router.use(authMiddleware);

router.get("/me", controller.getUser);

router.patch("/me", controller.updateUser);

router.patch("/me/password", controller.changePassword);

module.exports = router;