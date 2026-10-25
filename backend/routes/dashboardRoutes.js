const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Admin-only dashboard statistics
router.get("/", protect, adminOnly, getDashboardStats);

module.exports = router;
