const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { cloudinary } = require("../config/cloudinary");

const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAMESITE || "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

// Helper: upload buffer to Cloudinary with fallback
const uploadToCloudinary = (fileBuffer, folder = "partners") => {
    return new Promise((resolve) => {
        if (!fileBuffer || !cloudinary.config().api_key) {
            return resolve({ secure_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60" });
        }
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image" },
            (error, result) => {
                if (error) {
                    console.warn("Cloudinary upload failed, using fallback:", error.message);
                    return resolve({ secure_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60" });
                }
                resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};

// @desc Validate invite token
// @route GET /api/onboard/invite/:token
const getInviteDetails = async (req, res) => {
    const { token } = req.params;
    if (!token) {
        return res.status(400).json({ success: false, message: "Token is required" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        inviteTokenHash: tokenHash,
        status: "invited",
        inviteExpiresAt: { $gt: new Date() },
    });

    if (!user) {
        return res.status(410).json({
            success: false,
            message: "This invitation link is invalid or has expired. Please ask the restaurant owner to resend it.",
        });
    }

    res.status(200).json({
        success: true,
        invite: {
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

// @desc Accept manager invite and set password
// @route POST /api/onboard/accept
const acceptInvite = async (req, res) => {
    const { token, password, phone } = req.body;

    if (!token || !password) {
        return res.status(400).json({ success: false, message: "Token and password are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        inviteTokenHash: tokenHash,
        status: "invited",
        inviteExpiresAt: { $gt: new Date() },
    });

    if (!user) {
        return res.status(410).json({
            success: false,
            message: "Invitation has expired or is invalid.",
        });
    }

    // Set new password directly and activate user
    await user.setPassword(password);
    if (phone) user.phone = phone;
    user.status = "active";
    user.inviteTokenHash = undefined;
    user.inviteExpiresAt = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);
    res.cookie("token", jwtToken, cookieOptions());

    res.status(200).json({
        success: true,
        message: "Account activated successfully! Welcome to the team.",
        token: jwtToken,
        user,
    });
};

// @desc Submit Delivery Partner application
// @route POST /api/onboard/partner/apply
const applyPartner = async (req, res) => {
    const {
        name,
        email,
        phone,
        password,
        vehicleType,
        vehicleNumber,
        licenceNumber,
        shift,
    } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({
            success: false,
            message: "Name, email, phone, and password are required",
        });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
        if (user.status === "rejected" && user.role === "delivery_partner") {
            // Allow re-applying
            user.name = name;
            user.phone = phone;
            await user.setPassword(password);
            user.status = "pending";
            if (!user.deliveryProfile) user.deliveryProfile = {};
            user.deliveryProfile.vehicleType = vehicleType || "bike";
            user.deliveryProfile.vehicleNumber = vehicleNumber || "";
            user.deliveryProfile.licenceNumber = licenceNumber || "";
            user.deliveryProfile.shift = shift || "full_day";
            user.deliveryProfile.rejectionReason = "";
            user.deliveryProfile.reviewedAt = undefined;
            user.deliveryProfile.reviewedBy = undefined;
            await user.save();

            const token = generateToken(user._id);
            res.cookie("token", token, cookieOptions());

            return res.status(200).json({
                success: true,
                message: "Application re-submitted for review",
                token,
                user,
            });
        }

        return res.status(409).json({
            success: false,
            message: "An account with this email address already exists.",
        });
    }

    // Process uploaded documents if present
    const documents = [];
    if (req.files) {
        if (req.files.licence?.[0]) {
            const upl = await uploadToCloudinary(req.files.licence[0].buffer, "partners/licences");
            documents.push({ type: "licence", url: upl.secure_url });
        }
        if (req.files.id_proof?.[0]) {
            const upl = await uploadToCloudinary(req.files.id_proof[0].buffer, "partners/id_proofs");
            documents.push({ type: "id_proof", url: upl.secure_url });
        }
        if (req.files.photo?.[0]) {
            const upl = await uploadToCloudinary(req.files.photo[0].buffer, "partners/photos");
            documents.push({ type: "photo", url: upl.secure_url });
        }
    }

    // Fallbacks if no documents were uploaded
    if (!documents.some((d) => d.type === "licence")) {
        documents.push({ type: "licence", url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400" });
    }
    if (!documents.some((d) => d.type === "id_proof")) {
        documents.push({ type: "id_proof", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" });
    }
    if (!documents.some((d) => d.type === "photo")) {
        documents.push({ type: "photo", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" });
    }

    user = new User({
        name,
        email: normalizedEmail,
        phone,
        role: "delivery_partner",
        status: "pending",
        deliveryProfile: {
            vehicleType: vehicleType || "bike",
            vehicleNumber: vehicleNumber || "",
            licenceNumber: licenceNumber || "",
            shift: shift || "full_day",
            documents,
            isOnline: false,
        },
    });
    await user.setPassword(password);
    await user.save();

    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions());

    res.status(201).json({
        success: true,
        message: "Application submitted! Our operations team will review your documents shortly.",
        token,
        user,
    });
};

module.exports = {
    getInviteDetails,
    acceptInvite,
    applyPartner,
};
