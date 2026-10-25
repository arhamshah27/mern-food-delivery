const FoodItem = require("../models/FoodItem");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryUploader");

// @desc Get all foods with filters (search, category, veg/non-veg, availability, isPopular)
// @route GET /api/foods
const getFoods = async (req, res) => {
    const { category, foodType, search, availableOnly, popularOnly } = req.query;

    const query = {};

    if (category && category !== "all") {
        query.category = category;
    }

    if (foodType && foodType !== "all") {
        query.foodType = foodType;
    }

    if (availableOnly === "true") {
        query.isAvailable = true;
    }

    if (popularOnly === "true") {
        query.isPopular = true;
    }

    if (search && search.trim() !== "") {
        query.$or = [
            { name: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } },
        ];
    }

    const foods = await FoodItem.find(query)
        .populate("category", "name")
        .populate("addOns", "name price isAvailable")
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: foods.length, foods });
};

// @desc Get single food item
// @route GET /api/foods/:id
const getFoodById = async (req, res) => {
    const food = await FoodItem.findById(req.params.id)
        .populate("category", "name")
        .populate("addOns", "name price isAvailable");

    if (!food) {
        return res.status(404).json({ success: false, message: "Food item not found" });
    }
    res.status(200).json({ success: true, food });
};

// @desc Create food item
// @route POST /api/foods
const createFood = async (req, res) => {
    const { name, description, category, price, foodType, preparationTime, isPopular, isAvailable, addOns } = req.body;

    if (!name || !description || !category || price === undefined) {
        return res.status(400).json({
            success: false,
            message: "Name, description, category, and price are required",
        });
    }

    let parsedAddOns = [];
    if (addOns) {
        try {
            parsedAddOns = typeof addOns === "string" ? JSON.parse(addOns) : addOns;
        } catch {
            parsedAddOns = [];
        }
    }

    const foodData = {
        name: name.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        foodType: foodType || "veg",
        preparationTime: preparationTime ? Number(preparationTime) : 20,
        isPopular: isPopular === true || isPopular === "true",
        isAvailable: isAvailable !== undefined ? isAvailable === true || isAvailable === "true" : true,
        addOns: parsedAddOns,
    };

    if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer, "foods");
        foodData.image = uploadResult.secure_url;
        foodData.cloudinaryPublicId = uploadResult.public_id;
    }

    const food = await FoodItem.create(foodData);
    const populated = await FoodItem.findById(food._id)
        .populate("category", "name")
        .populate("addOns", "name price isAvailable");

    res.status(201).json({ success: true, message: "Food item created successfully", food: populated });
};

// @desc Update food item
// @route PUT /api/foods/:id
const updateFood = async (req, res) => {
    const food = await FoodItem.findById(req.params.id);
    if (!food) {
        return res.status(404).json({ success: false, message: "Food item not found" });
    }

    const { name, description, category, price, foodType, preparationTime, isPopular, isAvailable, addOns } = req.body;

    if (name) food.name = name.trim();
    if (description) food.description = description.trim();
    if (category) food.category = category;
    if (price !== undefined) food.price = Number(price);
    if (foodType) food.foodType = foodType;
    if (preparationTime !== undefined) food.preparationTime = Number(preparationTime);
    if (isPopular !== undefined) food.isPopular = isPopular === true || isPopular === "true";
    if (isAvailable !== undefined) food.isAvailable = isAvailable === true || isAvailable === "true";

    if (addOns !== undefined) {
        try {
            food.addOns = typeof addOns === "string" ? JSON.parse(addOns) : addOns;
        } catch {
            // Keep existing if invalid json
        }
    }

    if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer, "foods");
        if (food.cloudinaryPublicId) {
            await deleteFromCloudinary(food.cloudinaryPublicId);
        }
        food.image = uploadResult.secure_url;
        food.cloudinaryPublicId = uploadResult.public_id;
    }

    await food.save();
    const updated = await FoodItem.findById(food._id)
        .populate("category", "name")
        .populate("addOns", "name price isAvailable");

    res.status(200).json({ success: true, message: "Food item updated successfully", food: updated });
};

// @desc Delete food item
// @route DELETE /api/foods/:id
const deleteFood = async (req, res) => {
    const food = await FoodItem.findById(req.params.id);
    if (!food) {
        return res.status(404).json({ success: false, message: "Food item not found" });
    }

    if (food.cloudinaryPublicId) {
        await deleteFromCloudinary(food.cloudinaryPublicId);
    }

    await FoodItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Food item deleted successfully" });
};

// @desc Toggle food availability
// @route PATCH /api/foods/:id/availability
const toggleFoodAvailability = async (req, res) => {
    const food = await FoodItem.findById(req.params.id);
    if (!food) {
        return res.status(404).json({ success: false, message: "Food item not found" });
    }

    if (typeof req.body.isAvailable === "boolean") {
        food.isAvailable = req.body.isAvailable;
    } else {
        food.isAvailable = !food.isAvailable;
    }

    await food.save();
    res.status(200).json({
        success: true,
        message: `${food.name} is now ${food.isAvailable ? "In Stock" : "Out of Stock"}`,
        isAvailable: food.isAvailable,
        food,
    });
};

module.exports = {
    getFoods,
    getFoodById,
    createFood,
    updateFood,
    deleteFood,
    toggleFoodAvailability,
};
