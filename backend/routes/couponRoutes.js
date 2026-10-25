const express = require("express");
const router = express.Router();
const {
    validateCoupon,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} = require("../controllers/couponController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Customer route
router.post("/validate", protect, validateCoupon);

// Admin-only routes
router.get("/", protect, adminOnly, getCoupons);
router.post("/", protect, adminOnly, createCoupon);
router.put("/:id", protect, adminOnly, updateCoupon);
router.delete("/:id", protect, adminOnly, deleteCoupon);

module.exports = router;
