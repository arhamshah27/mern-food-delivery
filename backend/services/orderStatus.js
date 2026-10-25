const { can } = require("../config/permissions");

// Normalize status format to standard lowercase snake_case
function normalizeStatus(status) {
    if (!status) return "";
    const map = {
        "placed": "placed",
        "preparing": "preparing",
        "out for delivery": "out_for_delivery",
        "out_for_delivery": "out_for_delivery",
        "delivered": "delivered",
        "cancelled": "cancelled",
        "pending_payment": "pending_payment",
        "pending payment": "pending_payment",
    };
    return map[status.toLowerCase().trim()] || status.toLowerCase().trim();
}

// Map from internal format to title case for backward compatibility
function toDisplayStatus(status) {
    const map = {
        "placed": "Placed",
        "preparing": "Preparing",
        "out_for_delivery": "Out for delivery",
        "delivered": "Delivered",
        "cancelled": "Cancelled",
        "pending_payment": "Pending Payment",
    };
    return map[normalizeStatus(status)] || status;
}

// from -> allowed next statuses
const TRANSITIONS = {
    pending_payment: ["placed", "cancelled"],
    placed: ["preparing", "cancelled"],
    preparing: ["out_for_delivery", "cancelled"],
    out_for_delivery: ["delivered"],
    delivered: [],
    cancelled: [],
};

function canTransition(order, nextStatusRaw, user) {
    const current = normalizeStatus(order.status);
    const next = normalizeStatus(nextStatusRaw);

    if (!TRANSITIONS[current]?.includes(next)) {
        return `Cannot move from ${toDisplayStatus(current)} to ${toDisplayStatus(next)}`;
    }

    const isPartner = user.role === "delivery_partner";
    if (isPartner) {
        const partnerId = order.delivery?.partner || order.assignedPartner;
        if (String(partnerId) !== String(user._id)) {
            return "This order is not assigned to you";
        }
        if (!["out_for_delivery", "delivered"].includes(next)) {
            return "Delivery partners can only start or complete delivery";
        }
        if (next === "out_for_delivery" && !order.delivery?.acceptedAt && !order.assignedAt) {
            return "Accept the order first";
        }
        return null;
    }

    if (!can(user.role, "orders:status")) {
        return "Not authorized to change order status";
    }

    if (next === "out_for_delivery" && !order.delivery?.partner && !order.assignedPartner) {
        return "Assign a delivery partner first before marking out for delivery";
    }

    return null;
}

function pushStatus(order, nextStatusRaw, user = null, note = "") {
    const next = normalizeStatus(nextStatusRaw);
    const displayStatus = toDisplayStatus(next);

    order.status = displayStatus; // Store in existing display format or standard format

    const historyEntry = {
        status: next,
        at: new Date(),
        by: user?._id || null,
        byRole: user?.role || "system",
        note: note || "",
    };

    if (!order.statusHistory) {
        order.statusHistory = [];
    }
    order.statusHistory.push(historyEntry);

    if (!order.timeline) {
        order.timeline = [];
    }
    order.timeline.push({
        status: displayStatus,
        at: new Date(),
        note: note || "",
    });

    // If delivered via COD, mark cash collected
    if (next === "delivered") {
        const method = (order.paymentMethod || "").toUpperCase();
        if (method === "COD") {
            order.cashCollected = true;
            order.paymentStatus = "Completed";
        }
    }

    // If cancelled and paid online, set paymentStatus to Refunded or process refund
    if (next === "cancelled") {
        if (order.cancelledReason !== note && note) {
            order.cancelledReason = note;
        }
        const pStatus = (order.paymentStatus || "").toLowerCase();
        if (pStatus === "completed" || pStatus === "paid") {
            order.paymentStatus = "Refunded";
        }
    }
}

module.exports = {
    TRANSITIONS,
    normalizeStatus,
    toDisplayStatus,
    canTransition,
    pushStatus,
};
