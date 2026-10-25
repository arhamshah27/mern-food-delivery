const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getMe,
    logout,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// ── Public routes ──────────────────────────────────────────────────
router.post("/register", upload.single("profileImage"), register);
router.post("/login", login);

// ── Protected routes ───────────────────────────────────────────────
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
