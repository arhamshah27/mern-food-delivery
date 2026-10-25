const Coupon = require("../models/Coupon");

// @desc Validate coupon for customer checkout
// @route POST /api/coupons/validate
const validateCoupon = async (req, res) => {
    const { code, cartTotal } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
        return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
        return res.status(400).json({ success: false, message: "This coupon is no longer active" });
    }

    if (new Date(coupon.expirationDate) < new Date()) {
        return res.status(400).json({ success: false, message: "This coupon has expired" });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }

    const total = Number(cartTotal) || 0;
    if (total < coupon.minimumOrder) {
        return res.status(400).json({
            success: false,
            message: `Minimum order amount of ₹${coupon.minimumOrder} required for this coupon`,
        });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
        discountAmount = Math.round((total * coupon.discountValue) / 100);
    } else {
        discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed order total
    discountAmount = Math.min(discountAmount, total);

    res.status(200).json({
        success: true,
        message: "Coupon applied successfully",
        coupon: {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount,
        },
    });
};

// @desc Get all coupons (admin)
// @route GET /api/coupons
const getCoupons = async (req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: coupons.length, coupons });
};

// @desc Create coupon (admin)
// @route POST /api/coupons
const createCoupon = async (req, res) => {
    const { code, discountType, discountValue, minimumOrder, expirationDate, usageLimit, isActive } = req.body;

    if (!code || discountValue === undefined || !expirationDate) {
        return res.status(400).json({
            success: false,
            message: "Code, discount value, and expiration date are required",
        });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
        return res.status(409).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
        code: code.toUpperCase().trim(),
        discountType: discountType || "percentage",
        discountValue: Number(discountValue),
        minimumOrder: minimumOrder ? Number(minimumOrder) : 0,
        expirationDate: new Date(expirationDate),
        usageLimit: usageLimit ? Number(usageLimit) : 100,
        isActive: isActive !== undefined ? isActive === true || isActive === "true" : true,
    });

    res.status(201).json({ success: true, message: "Coupon created successfully", coupon });
};

// @desc Update coupon (admin)
// @route PUT /api/coupons/:id
const updateCoupon = async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    const { code, discountType, discountValue, minimumOrder, expirationDate, usageLimit, isActive } = req.body;

    if (code) coupon.code = code.toUpperCase().trim();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minimumOrder !== undefined) coupon.minimumOrder = Number(minimumOrder);
    if (expirationDate) coupon.expirationDate = new Date(expirationDate);
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
    if (isActive !== undefined) coupon.isActive = isActive === true || isActive === "true";

    await coupon.save();
    res.status(200).json({ success: true, message: "Coupon updated successfully", coupon });
};

// @desc Delete coupon (admin)
// @route DELETE /api/coupons/:id
const deleteCoupon = async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
};

module.exports = {
    validateCoupon,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
};
