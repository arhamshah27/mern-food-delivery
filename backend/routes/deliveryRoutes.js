const express = require("express");
const router = express.Router();
const {
    getDeliveryProfile,
    toggleOnline,
    getAssignedOrders,
    markCashCollected,
} = require("../controllers/deliveryController");
const {
    acceptOrder,
    updateOrderStatus,
    updateOrderLocation,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// All delivery routes require logged-in user with delivery:own permission or role
router.use(protect, authorize("delivery:own"));

router.get("/me", getDeliveryProfile);
router.patch("/online", toggleOnline);
router.get("/orders", getAssignedOrders);

router.patch("/orders/:id/accept", acceptOrder);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/cash-collected", markCashCollected);
router.patch("/orders/:id/location", updateOrderLocation);

module.exports = router;
