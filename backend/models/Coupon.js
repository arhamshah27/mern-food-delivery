const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            default: "percentage",
        },
        discountValue: {
            type: Number,
            required: [true, "Discount value is required"],
            min: [0, "Discount cannot be negative"],
        },
        minimumOrder: {
            type: Number,
            default: 0,
        },
        expirationDate: {
            type: Date,
            required: [true, "Expiration date is required"],
        },
        usageLimit: {
            type: Number,
            default: 100,
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
