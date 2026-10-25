const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    foodItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem",
        required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, default: function () { return this.unitPrice || 0; } },
    unitPrice: { type: Number },
    quantity: { type: Number, required: true, min: 1 },
    foodType: { type: String, enum: ["veg", "non-veg"], default: "veg" },
    image: { type: String, default: "" },
    selectedAddOns: [
        {
            addOn: { type: mongoose.Schema.Types.ObjectId, ref: "AddOn" },
            name: { type: String, required: true },
            price: { type: Number, required: true },
        },
    ],
    itemTotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        customerDetails: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
            deliveryAddress: { type: String, required: true },
            deliveryTime: { type: String, default: "Standard (30-45 mins)" },
            specialInstructions: { type: String, default: "" },
        },
        items: [orderItemSchema],
        subtotal: {
            type: Number,
            required: true,
        },
        tax: {
            type: Number,
            default: 0,
        },
        deliveryCharge: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        couponCode: {
            type: String,
            default: "",
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "Online"],
            default: "COD",
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Completed", "Failed"],
            default: "Pending",
        },
        assignedPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        assignedAt: Date,
        delivery: {
            partner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            assignedAt: Date,
            acceptedAt: Date,
        },
        cashCollected: {
            type: Boolean,
            default: false,
        },
        tracking: {
            lastLocation: { lat: Number, lng: Number, at: Date },
            path: [{ lat: Number, lng: Number, at: Date, _id: false }],
            distanceKm: Number,
            etaMinutes: Number,
        },
        razorpayOrderId: {
            type: String,
            default: "",
        },
        razorpayPaymentId: {
            type: String,
            default: "",
        },
        razorpayRefundId: {
            type: String,
            default: "",
        },
        addressDetails: {
            lat: { type: Number, default: 22.3072 },
            lng: { type: Number, default: 73.1812 },
            line1: String,
            city: String,
            pincode: String,
        },
        timeline: [
            {
                status: { type: String, required: true },
                at: { type: Date, default: Date.now },
                note: { type: String, default: "" },
            },
        ],
        statusHistory: [
            {
                status: { type: String, required: true },
                at: { type: Date, default: Date.now },
                by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                byRole: { type: String, default: "system" },
                note: { type: String, default: "" },
                _id: false,
            },
        ],
        status: {
            type: String,
            enum: [
                "pending_payment", "placed", "preparing", "out_for_delivery", "delivered", "cancelled",
                "Placed", "Preparing", "Out for delivery", "Delivered", "Cancelled"
            ],
            default: "placed",
        },
        cancelledReason: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
