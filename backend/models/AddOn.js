const mongoose = require("mongoose");

const addOnSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Add-on name is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        associatedDishes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "FoodItem",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("AddOn", addOnSchema);
