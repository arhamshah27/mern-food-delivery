const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Banner title is required"],
            trim: true,
        },
        subtitle: {
            type: String,
            default: "",
            trim: true,
        },
        buttonText: {
            type: String,
            default: "Order Now",
        },
        buttonLink: {
            type: String,
            default: "/menu",
        },
        image: {
            type: String,
            required: [true, "Banner image is required"],
        },
        cloudinaryPublicId: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        displayOrder: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
