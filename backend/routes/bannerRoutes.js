const express = require("express");
const router = express.Router();
const {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
} = require("../controllers/bannerController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", getBanners);

// Admin-only routes
router.post("/", protect, adminOnly, upload.single("image"), createBanner);
router.put("/:id", protect, adminOnly, upload.single("image"), updateBanner);
router.delete("/:id", protect, adminOnly, deleteBanner);

module.exports = router;
