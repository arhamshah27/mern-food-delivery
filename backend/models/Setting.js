const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
    {
        restaurantName: {
            type: String,
            default: "Baroda Gourmet Kitchen",
        },
        tagline: {
            type: String,
            default: "Fresh flavors delivered to your doorstep",
        },
        phone: {
            type: String,
            default: "+91 98765 43210",
        },
        email: {
            type: String,
            default: "support@barodagourmet.com",
        },
        address: {
            type: String,
            default: "Alkapuri Main Road, Vadodara, Gujarat 390007",
        },
        openingTime: {
            type: String,
            default: "10:00 AM",
        },
        closingTime: {
            type: String,
            default: "11:00 PM",
        },
        workingDays: {
            type: String,
            default: "Monday - Sunday",
        },
        location: {
            lat: { type: Number, default: 22.3072 },
            lng: { type: Number, default: 73.1812 },
            address: { type: String, default: "Alkapuri Main Road, Vadodara, Gujarat 390007" },
        },
        deliveryRadiusKm: {
            type: Number,
            default: 12,
        },
        freeDeliveryAbove: {
            type: Number,
            default: 499,
        },
        onlinePaymentEnabled: {
            type: Boolean,
            default: true,
        },
        codEnabled: {
            type: Boolean,
            default: true,
        },
        isOpen: {
            type: Boolean,
            default: true,
        },
        deliveryCharge: {
            type: Number,
            default: 40,
        },
        taxPercentage: {
            type: Number,
            default: 5,
        },
        minimumOrderAmount: {
            type: Number,
            default: 150,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
