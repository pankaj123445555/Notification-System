const express = require("express");
const authenticateApp = require("../middleware/auth.middleware");

const controller = require("../controllers/notification.controller");

const router = express.Router();

router.post("/send-email", authenticateApp, controller.sendEmail);

module.exports = router;
