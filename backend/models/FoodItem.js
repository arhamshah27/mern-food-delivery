const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Dish name is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        foodType: {
            type: String,
            enum: ["veg", "non-veg"],
            default: "veg",
        },
        preparationTime: {
            type: Number, // in minutes
            default: 20,
        },
        image: {
            type: String,
            default: "",
        },
        cloudinaryPublicId: {
            type: String,
            default: "",
        },
        isPopular: {
            type: Boolean,
            default: false,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        addOns: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "AddOn",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("FoodItem", foodItemSchema);
