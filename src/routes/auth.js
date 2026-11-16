const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const controller = require("../controllers/authController");

router.post("/register", controller.register);

router.post("/login", controller.login);

// router.use(authMiddleware);

router.post("/logout", controller.logout);

module.exports = router;