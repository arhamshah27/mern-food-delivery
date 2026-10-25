const Setting = require("../models/Setting");

// @desc Get restaurant settings (public)
// @route GET /api/settings
const getSettings = async (_req, res) => {
    let settings = await Setting.findOne();
    if (!settings) {
        settings = await Setting.create({});
    }
    res.status(200).json({ success: true, settings });
};

// @desc Update restaurant settings (admin)
// @route PUT /api/settings
const updateSettings = async (req, res) => {
    let settings = await Setting.findOne();
    if (!settings) {
        settings = new Setting({});
    }

    const {
        restaurantName,
        tagline,
        phone,
        email,
        address,
        openingTime,
        closingTime,
        workingDays,
        isOpen,
        deliveryCharge,
        taxPercentage,
        minimumOrderAmount,
        location,
        deliveryRadiusKm,
        freeDeliveryAbove,
        onlinePaymentEnabled,
        codEnabled,
    } = req.body;

    if (restaurantName) settings.restaurantName = restaurantName;
    if (tagline !== undefined) settings.tagline = tagline;
    if (phone) settings.phone = phone;
    if (email) settings.email = email;
    if (address) settings.address = address;
    if (openingTime) settings.openingTime = openingTime;
    if (closingTime) settings.closingTime = closingTime;
    if (workingDays) settings.workingDays = workingDays;
    if (isOpen !== undefined) settings.isOpen = isOpen === true || isOpen === "true";
    if (deliveryCharge !== undefined) settings.deliveryCharge = Number(deliveryCharge);
    if (taxPercentage !== undefined) settings.taxPercentage = Number(taxPercentage);
    if (minimumOrderAmount !== undefined) settings.minimumOrderAmount = Number(minimumOrderAmount);
    if (deliveryRadiusKm !== undefined) settings.deliveryRadiusKm = Number(deliveryRadiusKm);
    if (freeDeliveryAbove !== undefined) settings.freeDeliveryAbove = Number(freeDeliveryAbove);
    if (onlinePaymentEnabled !== undefined) settings.onlinePaymentEnabled = onlinePaymentEnabled === true || onlinePaymentEnabled === "true";
    if (codEnabled !== undefined) settings.codEnabled = codEnabled === true || codEnabled === "true";
    if (location && typeof location === "object") {
        settings.location = {
            lat: Number(location.lat) || settings.location?.lat || 22.3072,
            lng: Number(location.lng) || settings.location?.lng || 73.1812,
            address: location.address || settings.location?.address || address,
        };
    }

    await settings.save();
    res.status(200).json({ success: true, message: "Settings updated successfully", settings });
};

module.exports = {
    getSettings,
    updateSettings,
};
