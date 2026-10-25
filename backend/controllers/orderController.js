const Order = require("../models/Order");
const FoodItem = require("../models/FoodItem");
const Setting = require("../models/Setting");
const Coupon = require("../models/Coupon");

const { canTransition, pushStatus, normalizeStatus, toDisplayStatus } = require("../services/orderStatus");
const User = require("../models/User");

// Helper to generate readable unique order number like ORD-94821
const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${timestamp}${random}`;
};

// @desc Create a new order (customer)
// @route POST /api/orders
const createOrder = async (req, res) => {
    const { items, customerDetails, couponCode, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "Cart cannot be empty" });
    }

    if (!customerDetails || !customerDetails.name || !customerDetails.phone || !customerDetails.deliveryAddress) {
        return res.status(400).json({
            success: false,
            message: "Delivery address, contact phone, and customer name are required",
        });
    }

    // Load store settings for delivery charge and tax
    let settings = await Setting.findOne();
    if (!settings) {
        settings = { deliveryCharge: 40, taxPercentage: 5, minimumOrderAmount: 150, isOpen: true };
    }

    if (settings.isOpen === false) {
        return res.status(400).json({
            success: false,
            message: "The restaurant is currently closed and not accepting orders.",
        });
    }

    // Backend independent calculation of items and prices
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
        const food = await FoodItem.findById(item.foodItemId || item._id).populate("addOns");
        if (!food) {
            return res.status(400).json({
                success: false,
                message: `Dish "${item.name || "Unknown"}" is no longer available`,
            });
        }

        if (!food.isAvailable) {
            return res.status(400).json({
                success: false,
                message: `Dish "${food.name}" is currently out of stock`,
            });
        }

        const qty = Number(item.quantity) || 1;
        let unitPrice = food.price;
        const selectedAddOns = [];

        if (item.selectedAddOns && Array.isArray(item.selectedAddOns)) {
            for (const sel of item.selectedAddOns) {
                const addOnMatch = food.addOns.find((a) => a._id.toString() === (sel._id || sel.addOn || sel).toString());
                if (addOnMatch) {
                    unitPrice += addOnMatch.price;
                    selectedAddOns.push({
                        addOn: addOnMatch._id,
                        name: addOnMatch.name,
                        price: addOnMatch.price,
                    });
                }
            }
        }

        const itemTotal = unitPrice * qty;
        calculatedSubtotal += itemTotal;

        validatedItems.push({
            foodItem: food._id,
            name: food.name,
            price: food.price,
            quantity: qty,
            foodType: food.foodType,
            image: food.image,
            selectedAddOns,
            itemTotal,
        });
    }

    if (calculatedSubtotal < settings.minimumOrderAmount) {
        return res.status(400).json({
            success: false,
            message: `Minimum order amount is ₹${settings.minimumOrderAmount}`,
        });
    }

    // Calculate coupon discount if present
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim(), isActive: true });
        if (coupon && new Date(coupon.expirationDate) >= new Date() && calculatedSubtotal >= coupon.minimumOrder) {
            appliedCoupon = coupon;
            if (coupon.discountType === "percentage") {
                discount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
            } else {
                discount = coupon.discountValue;
            }
            discount = Math.min(discount, calculatedSubtotal);
        }
    }

    const taxableAmount = Math.max(0, calculatedSubtotal - discount);
    const tax = Math.round((taxableAmount * settings.taxPercentage) / 100);
    const deliveryCharge = settings.deliveryCharge;
    const totalAmount = taxableAmount + tax + deliveryCharge;

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
        orderNumber,
        user: req.user._id,
        customerDetails: {
            name: customerDetails.name,
            email: customerDetails.email || req.user.email,
            phone: customerDetails.phone,
            deliveryAddress: customerDetails.deliveryAddress,
            deliveryTime: customerDetails.deliveryTime || "Standard (30-45 mins)",
            specialInstructions: customerDetails.specialInstructions || "",
        },
        items: validatedItems,
        subtotal: calculatedSubtotal,
        tax,
        deliveryCharge,
        discount,
        couponCode: couponCode ? couponCode.toUpperCase().trim() : "",
        totalAmount,
        paymentMethod: paymentMethod || "COD",
        paymentStatus: paymentMethod === "Online" ? "Completed" : "Pending",
        status: "Placed",
        statusHistory: [
            {
                status: "placed",
                at: new Date(),
                by: req.user._id,
                byRole: req.user.role || "customer",
                note: "Order placed by customer",
            },
        ],
        timeline: [
            {
                status: "Placed",
                at: new Date(),
                note: "Order placed by customer",
            },
        ],
    });

    // Update coupon usage if applicable
    if (appliedCoupon) {
        appliedCoupon.usedCount += 1;
        await appliedCoupon.save();
    }

    res.status(201).json({
        success: true,
        message: "Order placed successfully!",
        order,
    });
};

// @desc Get logged-in user orders (customer)
// @route GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
};

// @desc Get single order by ID (customer or admin or assigned partner)
// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
    let order;
    if (req.params.id.startsWith("ORD-")) {
        order = await Order.findOne({ orderNumber: req.params.id }).populate("assignedPartner", "name phone email deliveryProfile");
    } else {
        order = await Order.findById(req.params.id).populate("assignedPartner", "name phone email deliveryProfile");
    }

    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isCustomer = order.user.toString() === req.user._id.toString();
    const isAdmin = ["admin", "owner", "shop_manager"].includes(req.user.role);
    const partnerId = order.delivery?.partner || order.assignedPartner?._id || order.assignedPartner;
    const isAssignedPartner = partnerId && partnerId.toString() === req.user._id.toString();

    if (!isCustomer && !isAdmin && !isAssignedPartner) {
        return res.status(403).json({ success: false, message: "Unauthorized to view this order" });
    }

    const orderObj = order.toObject();

    // Security/Privacy rule from spec: customer only sees delivery partner's phone while out_for_delivery
    const normalized = normalizeStatus(order.status);
    if (isCustomer && normalized !== "out_for_delivery") {
        if (orderObj.assignedPartner) {
            delete orderObj.assignedPartner.phone;
        }
    }

    res.status(200).json({ success: true, order: orderObj });
};

// @desc Get all orders (admin) with search and status filtering
// @route GET /api/orders
const getAllOrders = async (req, res) => {
    const { status, search, date } = req.query;
    const query = {};

    if (status && status !== "all") {
        const norm = normalizeStatus(status);
        const display = toDisplayStatus(norm);
        query.status = { $in: [norm, display] };
    }

    if (search && search.trim() !== "") {
        query.$or = [
            { orderNumber: { $regex: search.trim(), $options: "i" } },
            { "customerDetails.name": { $regex: search.trim(), $options: "i" } },
            { "customerDetails.phone": { $regex: search.trim(), $options: "i" } },
        ];
    }

    if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(query)
        .populate("assignedPartner", "name phone isOnline deliveryProfile")
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
};

// @desc Update order status with finite state machine validation
// @route PUT/PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
    const { status, cancelledReason, note } = req.body;

    if (!status) {
        return res.status(400).json({ success: false, message: "New status is required" });
    }

    let order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Validate transition
    const transitionError = canTransition(order, status, req.user);
    if (transitionError) {
        return res.status(400).json({ success: false, message: transitionError });
    }

    // Apply status update
    pushStatus(order, status, req.user, cancelledReason || note);
    await order.save();

    await order.populate("assignedPartner", "name phone isOnline deliveryProfile");

    res.status(200).json({
        success: true,
        message: `Order status updated to ${order.status}`,
        order,
    });
};

// @desc Assign delivery partner to order
// @route PATCH /api/orders/:id/assign
const assignPartner = async (req, res) => {
    const { partnerId } = req.body;
    if (!partnerId) {
        return res.status(400).json({ success: false, message: "partnerId is required" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    const currentStatus = normalizeStatus(order.status);
    if (!["placed", "preparing"].includes(currentStatus)) {
        return res.status(400).json({
            success: false,
            message: `Cannot assign partner when order is ${toDisplayStatus(currentStatus)}`,
        });
    }

    const partner = await User.findById(partnerId);
    if (!partner || partner.role !== "delivery_partner") {
        return res.status(400).json({ success: false, message: "User is not a valid delivery partner" });
    }

    if (partner.status !== "active") {
        return res.status(400).json({ success: false, message: "Delivery partner is not active" });
    }

    order.assignedPartner = partner._id;
    order.assignedAt = new Date();
    order.delivery = {
        partner: partner._id,
        assignedAt: new Date(),
        acceptedAt: null,
    };

    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: order.status,
        at: new Date(),
        note: `Assigned to delivery partner ${partner.name}`,
    });

    await order.save();
    await order.populate("assignedPartner", "name phone isOnline deliveryProfile");

    res.status(200).json({
        success: true,
        message: `Order assigned to ${partner.name}`,
        order,
    });
};

// @desc List available delivery partners
// @route GET /api/orders/partners/available
const getAvailablePartners = async (req, res) => {
    const partners = await User.find({
        role: "delivery_partner",
        status: "active",
    }).select("name phone email deliveryProfile isOnline");

    // Fetch active order counts for each partner
    const activeOrders = await Order.find({
        status: { $in: ["preparing", "out_for_delivery", "Preparing", "Out for delivery"] },
        $or: [{ assignedPartner: { $exists: true, $ne: null } }, { "delivery.partner": { $exists: true, $ne: null } }],
    }).select("assignedPartner delivery");

    const counts = {};
    for (const o of activeOrders) {
        const pid = (o.delivery?.partner || o.assignedPartner)?.toString();
        if (pid) counts[pid] = (counts[pid] || 0) + 1;
    }

    const partnersWithLoad = partners.map((p) => {
        const obj = p.toObject();
        obj.activeOrderCount = counts[p._id.toString()] || 0;
        return obj;
    });

    res.status(200).json({
        success: true,
        partners: partnersWithLoad,
    });
};

// @desc Delivery partner accepts assigned order
// @route PATCH /api/orders/:id/accept
const acceptOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    const partnerId = order.delivery?.partner || order.assignedPartner;
    if (String(partnerId) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: "Order is not assigned to you" });
    }

    const current = normalizeStatus(order.status);
    if (current !== "preparing" && current !== "placed") {
        return res.status(400).json({ success: false, message: `Cannot accept order in status ${order.status}` });
    }

    if (!order.delivery) order.delivery = {};
    order.delivery.acceptedAt = new Date();

    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: order.status,
        at: new Date(),
        note: `Accepted by ${req.user.name}`,
    });

    await order.save();
    res.status(200).json({ success: true, message: "Order accepted", order });
};

// @desc Update delivery partner live GPS location
// @route PATCH /api/orders/:id/location
const updateOrderLocation = async (req, res) => {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
        return res.status(400).json({ success: false, message: "lat and lng are required" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    const partnerId = order.delivery?.partner || order.assignedPartner;
    const isPartner = String(partnerId) === String(req.user._id);
    const isAdmin = ["admin", "owner", "shop_manager"].includes(req.user.role);

    if (!isPartner && !isAdmin) {
        return res.status(403).json({ success: false, message: "Not authorized to update tracking location" });
    }

    const now = new Date();
    if (!order.tracking) {
        order.tracking = { path: [] };
    }
    order.tracking.lastLocation = { lat: Number(lat), lng: Number(lng), at: now };

    if (!order.tracking.path) order.tracking.path = [];
    order.tracking.path.push({ lat: Number(lat), lng: Number(lng), at: now });
    if (order.tracking.path.length > 50) {
        order.tracking.path = order.tracking.path.slice(-50);
    }

    // Also update partner's user profile location if available
    await User.findByIdAndUpdate(partnerId, {
        "deliveryProfile.lastLocation": { lat: Number(lat), lng: Number(lng), at: now },
        isOnline: true,
    });

    await order.save();

    res.status(200).json({
        success: true,
        lastLocation: order.tracking.lastLocation,
        distanceKm: order.tracking.distanceKm,
        etaMinutes: order.tracking.etaMinutes,
    });
};

// @desc Get live tracking for all out_for_delivery orders
// @route GET /api/orders/tracking/live
const getLiveTracking = async (req, res) => {
    const activeOrders = await Order.find({
        status: { $in: ["out_for_delivery", "Out for delivery"] },
    }).populate("assignedPartner", "name phone deliveryProfile isOnline");

    let settings = await Setting.findOne();
    const restaurantLocation = {
        lat: settings?.coordinates?.lat || 22.3072,
        lng: settings?.coordinates?.lng || 73.1812,
    };

    const orders = activeOrders.map((o) => ({
        orderId: o._id,
        orderNumber: o.orderNumber,
        customerName: o.customerDetails?.name,
        destination: o.customerDetails?.deliveryAddress,
        addressDetails: o.addressDetails,
        partner: o.assignedPartner
            ? {
                  id: o.assignedPartner._id,
                  name: o.assignedPartner.name,
                  phone: o.assignedPartner.phone,
                  lastLocation: o.tracking?.lastLocation || o.assignedPartner.deliveryProfile?.lastLocation,
              }
            : null,
        tracking: o.tracking,
        etaMinutes: o.tracking?.etaMinutes || 15,
        totalAmount: o.totalAmount,
    }));

    res.status(200).json({
        success: true,
        restaurantLocation,
        orders,
    });
};

module.exports = {
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
};

