const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settingController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public
router.get("/", getSettings);

// Owner-only
router.put("/", protect, authorize("settings:write"), updateSettings);

module.exports = router;
