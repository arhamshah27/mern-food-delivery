const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { cloudinary } = require("../config/cloudinary");

// ─── Helper: cookie options ────────────────────────────────────────
const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAMESITE || "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// ─── Helper: upload buffer to Cloudinary ───────────────────────────
const uploadToCloudinary = (fileBuffer, folder = "profile_images") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                transformation: [
                    { width: 400, height: 400, crop: "fill", gravity: "face" },
                ],
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    const { name, email, password, role, phone, vehicleType, vehicleNumber, licenceNumber } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide name, email, and password",
        });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "An account with this email already exists",
        });
    }

    // Determine safe public role: rider/delivery_partner or customer
    const isRider = role === "rider" || role === "delivery_partner";
    const assignedRole = isRider ? "delivery_partner" : "customer";

    // Prepare user data
    const userData = {
        name,
        email,
        password,
        role: assignedRole,
        phone: phone || "",
        status: "active",
    };

    // If registering as a rider, populate delivery profile
    if (isRider) {
        userData.deliveryProfile = {
            vehicleType: ["bike", "scooter", "cycle"].includes(vehicleType) ? vehicleType : "bike",
            vehicleNumber: vehicleNumber ? vehicleNumber.trim().toUpperCase() : "",
            licenceNumber: licenceNumber ? licenceNumber.trim().toUpperCase() : "",
            shift: "full_day",
            isOnline: true,
            lastLocation: { lat: 22.3072, lng: 73.1812, at: new Date() },
        };
    }

    // Optional profile image upload
    if (req.file) {
        try {
            const result = await uploadToCloudinary(req.file.buffer);
            userData.profileImage = result.secure_url;
            userData.cloudinaryPublicId = result.public_id;
        } catch (uploadErr) {
            console.error("Cloudinary upload failed:", uploadErr.message);
            // Continue registration without image rather than failing entirely
        }
    }

    // Create user (password is hashed by the pre-save hook)
    const user = await User.create(userData);

    // Generate JWT & set cookie
    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions());

    res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
        user,
    });
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide email and password",
        });
    }

    // We need the password field for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password +passwordHash"
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    if (user.status === "suspended") {
        return res.status(403).json({
            success: false,
            message: "Your account has been suspended",
        });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions());

    // toJSON transform strips the password automatically
    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user,
    });
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};

/**
 * @desc    Logout user — clear the auth cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (_req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.COOKIE_SAMESITE || "lax",
        expires: new Date(0), // Expire immediately
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};

module.exports = { register, login, getMe, logout };
