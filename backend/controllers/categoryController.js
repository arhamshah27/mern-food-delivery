const Category = require("../models/Category");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryUploader");

// @desc Get all categories (with active filter option)
// @route GET /api/categories
const getCategories = async (req, res) => {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: categories.length, categories });
};

// @desc Get single category
// @route GET /api/categories/:id
const getCategoryById = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, category });
};

// @desc Create category
// @route POST /api/categories
const createCategory = async (req, res) => {
    const { name, description, isActive } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const categoryData = {
        name: name.trim(),
        description: description || "",
        isActive: isActive !== undefined ? isActive === "true" || isActive === true : true,
    };

    if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer, "categories");
        categoryData.image = uploadResult.secure_url;
        categoryData.cloudinaryPublicId = uploadResult.public_id;
    }

    const category = await Category.create(categoryData);
    res.status(201).json({ success: true, message: "Category created successfully", category });
};

// @desc Update category
// @route PUT /api/categories/:id
const updateCategory = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }

    const { name, description, isActive } = req.body;
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive === "true" || isActive === true;

    if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer, "categories");
        if (category.cloudinaryPublicId) {
            await deleteFromCloudinary(category.cloudinaryPublicId);
        }
        category.image = uploadResult.secure_url;
        category.cloudinaryPublicId = uploadResult.public_id;
    }

    await category.save();
    res.status(200).json({ success: true, message: "Category updated successfully", category });
};

// @desc Delete category
// @route DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (category.cloudinaryPublicId) {
        await deleteFromCloudinary(category.cloudinaryPublicId);
    }

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Category deleted successfully" });
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
