const express = require("express");
const router = express.Router();
const {
    getFoods,
    getFoodById,
    createFood,
    updateFood,
    deleteFood,
    toggleFoodAvailability,
} = require("../controllers/foodController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", getFoods);
router.get("/:id", getFoodById);

// Admin-only routes
router.post("/", protect, adminOnly, upload.single("image"), createFood);
router.put("/:id", protect, adminOnly, upload.single("image"), updateFood);
router.patch("/:id/availability", protect, adminOnly, toggleFoodAvailability);
router.delete("/:id", protect, adminOnly, deleteFood);

module.exports = router;
