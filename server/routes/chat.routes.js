const express = require("express");
const router = express.Router();
const { sendMessage, getHistory } = require("../controllers/chat.controller");
const { protect } = require("../middleware/auth.middleware");

// All chat routes are protected — user must be logged in
router.post("/",        protect, sendMessage);
router.get("/history",  protect, getHistory);

module.exports = router;