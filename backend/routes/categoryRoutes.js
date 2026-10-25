const express = require("express");
const router = express.Router();
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin-only routes
router.post("/", protect, adminOnly, upload.single("image"), createCategory);
router.put("/:id", protect, adminOnly, upload.single("image"), updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;
