const User = require("../models/User");
const Order = require("../models/Order");
const { canTransition, pushStatus, normalizeStatus, toDisplayStatus } = require("../services/orderStatus");

// @desc Get delivery partner profile & today's delivery stats
// @route GET /api/delivery/me
const getDeliveryProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    // Calculate today's delivery statistics
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const partnerId = req.user._id;
    const todayOrders = await Order.find({
        $or: [{ assignedPartner: partnerId }, { "delivery.partner": partnerId }],
        createdAt: { $gte: startOfToday },
    });

    let deliveredCount = 0;
    let cashToCollect = 0;
    let cashCollected = 0;

    for (const order of todayOrders) {
        const norm = normalizeStatus(order.status);
        if (norm === "delivered") {
            deliveredCount += 1;
            if (order.paymentMethod === "COD" || order.paymentMethod === "cod") {
                cashCollected += order.totalAmount || 0;
            }
        } else if (norm === "out_for_delivery") {
            if (order.paymentMethod === "COD" || order.paymentMethod === "cod") {
                cashToCollect += order.totalAmount || 0;
            }
        }
    }

    res.status(200).json({
        success: true,
        user,
        isOnline: Boolean(user.deliveryProfile?.isOnline || user.isOnline),
        stats: {
            delivered: deliveredCount,
            cashToCollect,
            cashCollected,
        },
    });
};

// @desc Toggle online/offline status
// @route PATCH /api/delivery/online
const toggleOnline = async (req, res) => {
    const { isOnline } = req.body;
    const partnerId = req.user._id;

    if (!isOnline) {
        // Going offline check: check if any active order is in 'out_for_delivery' or 'preparing'
        const activeOrders = await Order.countDocuments({
            $or: [{ assignedPartner: partnerId }, { "delivery.partner": partnerId }],
            status: { $in: ["preparing", "out_for_delivery", "Preparing", "Out for delivery"] },
        });

        if (activeOrders > 0) {
            return res.status(409).json({
                success: false,
                message: "Cannot go offline with an active assigned delivery. Please complete or reassign your orders first.",
            });
        }
    }

    const user = await User.findById(partnerId);
    if (!user.deliveryProfile) user.deliveryProfile = {};
    user.deliveryProfile.isOnline = Boolean(isOnline);
    user.isOnline = Boolean(isOnline);
    await user.save();

    res.status(200).json({
        success: true,
        message: `You are now ${isOnline ? "Online and accepting orders" : "Offline"}`,
        isOnline: Boolean(user.deliveryProfile.isOnline),
    });
};

// @desc Get assigned orders for logged in partner
// @route GET /api/delivery/orders
const getAssignedOrders = async (req, res) => {
    const partnerId = req.user._id;
    const { history } = req.query;

    const query = {
        $or: [{ assignedPartner: partnerId }, { "delivery.partner": partnerId }],
    };

    if (history === "1" || history === "true") {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        query.status = { $in: ["delivered", "Delivered"] };
        query.createdAt = { $gte: startOfToday };
    } else {
        query.status = { $in: ["placed", "Placed", "preparing", "Preparing", "out_for_delivery", "Out for delivery"] };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: orders.length,
        orders,
    });
};

// @desc Mark COD cash as collected
// @route PATCH /api/delivery/orders/:id/cash-collected
const markCashCollected = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    const partnerId = order.delivery?.partner || order.assignedPartner;
    if (String(partnerId) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: "This order is not assigned to you" });
    }

    order.cashCollected = true;
    order.paymentStatus = "Completed";
    await order.save();

    res.status(200).json({
        success: true,
        message: "Cash marked as collected",
        order,
    });
};

module.exports = {
    getDeliveryProfile,
    toggleOnline,
    getAssignedOrders,
    markCashCollected,
};
