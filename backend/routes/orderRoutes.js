const express = require("express");
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    assignPartner,
    getAvailablePartners,
    acceptOrder,
    updateOrderLocation,
    getLiveTracking,
} = require("../controllers/orderController");
const { protect, authorize, adminOnly } = require("../middlewares/authMiddleware");

// Customer routes (protected)
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

// Fleet Live Tracking
router.get("/tracking/live", protect, authorize("tracking:read", "orders:read"), getLiveTracking);

// Partner endpoints
router.get("/partners/available", protect, authorize("orders:assign", "orders:read"), getAvailablePartners);
router.patch("/:id/accept", protect, acceptOrder);
router.patch("/:id/location", protect, updateOrderLocation);

// Status updates (both admin/manager with orders:status, or delivery_partner for their own)
router.patch("/:id/status", protect, updateOrderStatus);
router.put("/:id/status", protect, updateOrderStatus);

// Partner assignment (owner, shop_manager)
router.patch("/:id/assign", protect, authorize("orders:assign"), assignPartner);

// Order detail & admin listing
router.get("/:id", protect, getOrderById);
router.get("/", protect, authorize("orders:read"), getAllOrders);

module.exports = router;
