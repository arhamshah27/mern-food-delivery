const User = require("../models/User");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryUploader");

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};

/**
 * @desc    Update user profile (name, email)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    // If email is changing, make sure the new one isn't taken
    if (email && email.toLowerCase() !== user.email) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already in use",
            });
        }
        user.email = email;
    }

    if (name) user.name = name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.address !== undefined) user.address = req.body.address;

    const updatedUser = await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
    });
};

/**
 * @desc    Upload / replace profile image
 * @route   PUT /api/users/profile/image
 * @access  Private
 */
const updateProfileImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please upload an image file",
        });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    // Upload new image to Cloudinary
    let uploadResult;
    try {
        uploadResult = await uploadToCloudinary(req.file.buffer);
    } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr.message);
        return res.status(500).json({
            success: false,
            message: "Image upload failed — please try again",
        });
    }

    // Delete old Cloudinary image if one exists
    const oldPublicId = user.cloudinaryPublicId;

    // Update user in database
    user.profileImage = uploadResult.secure_url;
    user.cloudinaryPublicId = uploadResult.public_id;

    try {
        await user.save();
    } catch (dbError) {
        // Rollback: delete the newly uploaded image since the DB save failed
        await deleteFromCloudinary(uploadResult.public_id);
        throw dbError;
    }

    // Clean up old image AFTER the database save succeeds
    if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
    }

    res.status(200).json({
        success: true,
        message: "Profile image updated successfully",
        user,
    });
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/account
 * @access  Private
 */
const deleteAccount = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    // Delete profile image from Cloudinary
    if (user.cloudinaryPublicId) {
        try {
            await cloudinary.uploader.destroy(user.cloudinaryPublicId);
        } catch (cleanupErr) {
            console.error("Cloudinary cleanup failed:", cleanupErr.message);
        }
    }

    await User.findByIdAndDelete(req.user._id);

    // Clear the auth cookie
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.COOKIE_SAMESITE || "lax",
        expires: new Date(0),
    });

    res.status(200).json({
        success: true,
        message: "Account deleted successfully",
    });
};

module.exports = {
    getProfile,
    updateProfile,
    updateProfileImage,
    deleteAccount,
};
