const Banner = require("../models/Banner");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryUploader");

// @desc Get active banners for customer or all banners for admin
// @route GET /api/banners
const getBanners = async (req, res) => {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const banners = await Banner.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: banners.length, banners });
};

// @desc Create banner
// @route POST /api/banners
const createBanner = async (req, res) => {
    const { title, subtitle, buttonText, buttonLink, isActive, displayOrder } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: "Title is required" });
    }

    if (!req.file) {
        return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, "banners");

    const banner = await Banner.create({
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : "",
        buttonText: buttonText || "Order Now",
        buttonLink: buttonLink || "/menu",
        image: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        isActive: isActive !== undefined ? isActive === true || isActive === "true" : true,
        displayOrder: displayOrder ? Number(displayOrder) : 1,
    });

    res.status(201).json({ success: true, message: "Banner created successfully", banner });
};

// @desc Update banner
// @route PUT /api/banners/:id
const updateBanner = async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
        return res.status(404).json({ success: false, message: "Banner not found" });
    }

    const { title, subtitle, buttonText, buttonLink, isActive, displayOrder } = req.body;

    if (title) banner.title = title.trim();
    if (subtitle !== undefined) banner.subtitle = subtitle.trim();
    if (buttonText !== undefined) banner.buttonText = buttonText;
    if (buttonLink !== undefined) banner.buttonLink = buttonLink;
    if (isActive !== undefined) banner.isActive = isActive === true || isActive === "true";
    if (displayOrder !== undefined) banner.displayOrder = Number(displayOrder);

    if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer, "banners");
        if (banner.cloudinaryPublicId) {
            await deleteFromCloudinary(banner.cloudinaryPublicId);
        }
        banner.image = uploadResult.secure_url;
        banner.cloudinaryPublicId = uploadResult.public_id;
    }

    await banner.save();
    res.status(200).json({ success: true, message: "Banner updated successfully", banner });
};

// @desc Delete banner
// @route DELETE /api/banners/:id
const deleteBanner = async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
        return res.status(404).json({ success: false, message: "Banner not found" });
    }

    if (banner.cloudinaryPublicId) {
        await deleteFromCloudinary(banner.cloudinaryPublicId);
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Banner deleted successfully" });
};

module.exports = {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
};
