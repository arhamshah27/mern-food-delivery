const AddOn = require("../models/AddOn");

// @desc Get all add-ons
// @route GET /api/addons
const getAddOns = async (req, res) => {
    const filter = req.query.availableOnly === "true" ? { isAvailable: true } : {};
    const addOns = await AddOn.find(filter).populate("associatedDishes", "name price").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: addOns.length, addOns });
};

// @desc Get single add-on
// @route GET /api/addons/:id
const getAddOnById = async (req, res) => {
    const addOn = await AddOn.findById(req.params.id).populate("associatedDishes", "name price");
    if (!addOn) {
        return res.status(404).json({ success: false, message: "Add-on not found" });
    }
    res.status(200).json({ success: true, addOn });
};

// @desc Create add-on
// @route POST /api/addons
const createAddOn = async (req, res) => {
    const { name, description, price, isAvailable, associatedDishes } = req.body;
    if (!name || price === undefined) {
        return res.status(400).json({ success: false, message: "Name and price are required" });
    }

    let parsedDishes = [];
    if (associatedDishes) {
        parsedDishes = typeof associatedDishes === "string" ? JSON.parse(associatedDishes) : associatedDishes;
    }

    const addOn = await AddOn.create({
        name: name.trim(),
        description: description || "",
        price: Number(price),
        isAvailable: isAvailable !== undefined ? isAvailable === true || isAvailable === "true" : true,
        associatedDishes: parsedDishes,
    });

    res.status(201).json({ success: true, message: "Add-on created successfully", addOn });
};

// @desc Update add-on
// @route PUT /api/addons/:id
const updateAddOn = async (req, res) => {
    const addOn = await AddOn.findById(req.params.id);
    if (!addOn) {
        return res.status(404).json({ success: false, message: "Add-on not found" });
    }

    const { name, description, price, isAvailable, associatedDishes } = req.body;
    if (name) addOn.name = name.trim();
    if (description !== undefined) addOn.description = description;
    if (price !== undefined) addOn.price = Number(price);
    if (isAvailable !== undefined) addOn.isAvailable = isAvailable === true || isAvailable === "true";
    if (associatedDishes !== undefined) {
        addOn.associatedDishes = typeof associatedDishes === "string" ? JSON.parse(associatedDishes) : associatedDishes;
    }

    await addOn.save();
    res.status(200).json({ success: true, message: "Add-on updated successfully", addOn });
};

// @desc Delete add-on
// @route DELETE /api/addons/:id
const deleteAddOn = async (req, res) => {
    const addOn = await AddOn.findById(req.params.id);
    if (!addOn) {
        return res.status(404).json({ success: false, message: "Add-on not found" });
    }
    await AddOn.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Add-on deleted successfully" });
};

module.exports = {
    getAddOns,
    getAddOnById,
    createAddOn,
    updateAddOn,
    deleteAddOn,
};
