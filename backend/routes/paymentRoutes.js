const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const Setting = require("../models/Setting");
const { protect } = require("../middlewares/authMiddleware");
const { priceCart } = require("../services/pricing");

// Helper to generate readable unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${timestamp}${random}`;
};

/**
 * @desc Create a Razorpay checkout order
 * @route POST /api/payments/create-order
 * @access Private
 */
router.post("/create-order", protect, async (req, res) => {
    try {
        const { items, customerDetails, couponCode } = req.body;

        if (!items || !items.length) {
            return res.status(400).json({ success: false, message: "Cart cannot be empty" });
        }

        const quote = await priceCart(items, couponCode, { strict: true });
        if (!quote.isOpen) {
            return res.status(400).json({ success: false, message: "Restaurant is currently closed" });
        }

        if (!quote.meetsMinimumOrder) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount of ₹${quote.minimumOrderAmount} required`,
            });
        }

        const amountPaise = Math.round(quote.totalAmount * 100);
        let razorpayOrderId = `order_sim_${Date.now()}`;

        if (razorpay) {
            const rzpOrder = await razorpay.orders.create({
                amount: amountPaise,
                currency: "INR",
                receipt: `rcpt_${Date.now().toString().slice(-6)}`,
            });
            razorpayOrderId = rzpOrder.id;
        }

        const order = await Order.create({
            orderNumber: generateOrderNumber(),
            user: req.user._id,
            customerDetails: {
                name: customerDetails.name,
                email: req.user.email || customerDetails.email,
                phone: customerDetails.phone,
                deliveryAddress: customerDetails.deliveryAddress,
                deliveryTime: customerDetails.deliveryTime || "Standard (30-45 mins)",
                specialInstructions: customerDetails.specialInstructions || "",
            },
            items: quote.lines.map((l) => ({
                foodItem: l.foodItem,
                name: l.name,
                price: l.price || l.unitPrice || 0,
                unitPrice: l.unitPrice || l.price || 0,
                quantity: l.quantity,
                foodType: l.foodType,
                image: l.image,
                selectedAddOns: l.selectedAddOns || [],
                itemTotal: l.itemTotal,
            })),
            subtotal: quote.subtotal,
            discount: quote.discount,
            couponCode: quote.couponCode || "",
            tax: quote.tax,
            deliveryCharge: quote.deliveryCharge,
            totalAmount: quote.totalAmount,
            paymentMethod: "Online",
            paymentStatus: "Pending",
            status: "pending_payment",
            razorpayOrderId,
            timeline: [
                {
                    status: "pending_payment",
                    note: "Online order initiated; awaiting payment confirmation",
                },
            ],
        });

        res.status(200).json({
            success: true,
            keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_simulated_key",
            amount: amountPaise,
            currency: "INR",
            razorpayOrderId,
            orderId: order._id,
            orderNumber: order.orderNumber,
            prefill: {
                name: customerDetails.name,
                email: req.user.email,
                contact: customerDetails.phone,
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to initialize payment: " + err.message,
        });
    }
});

/**
 * @desc Verify Razorpay payment signature
 * @route POST /api/payments/verify
 * @access Private
 */
router.post("/verify", protect, async (req, res) => {
    try {
        const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Verify signature if secret is provided
        if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ success: false, message: "Invalid payment signature" });
            }
        }

        order.status = "placed";
        order.paymentStatus = "Completed";
        order.razorpayPaymentId = razorpay_payment_id || `pay_sim_${Date.now()}`;
        order.timeline.push({
            status: "placed",
            note: "Payment successfully verified. Kitchen notified.",
        });

        await order.save();

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            order,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Payment verification failed: " + err.message,
        });
    }
});

/**
 * @desc Handle cancelled or failed payment
 * @route POST /api/payments/failed
 * @access Private
 */
router.post("/failed", protect, async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus === "Pending") {
            order.paymentStatus = "Failed";
            order.timeline.push({
                status: "payment_failed",
                note: reason || "Payment was dismissed or failed",
            });
            await order.save();
        }
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
