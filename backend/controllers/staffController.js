const crypto = require("crypto");
const User = require("../models/User");
const Order = require("../models/Order");

const getClientUrl = () => {
    return process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",")[0] : "http://localhost:5173";
};

// @desc List staff members (admin, delivery_partner)
// @route GET /api/admin/staff
const getStaff = async (req, res) => {
    const { role, status, search } = req.query;
    const query = {
        role: { $in: ["admin", "delivery_partner", "owner", "shop_manager"] },
    };

    if (role && role !== "all") {
        if (role === "admin" || role === "owner" || role === "shop_manager") {
            query.role = { $in: ["admin", "owner", "shop_manager"] };
        } else if (role === "delivery_partner" || role === "rider" || role === "delivery_rider") {
            query.role = "delivery_partner";
        } else {
            query.role = role;
        }
    }
    if (status && status !== "all") query.status = status;
    if (search && search.trim()) {
        query.$or = [
            { name: { $regex: search.trim(), $options: "i" } },
            { email: { $regex: search.trim(), $options: "i" } },
            { phone: { $regex: search.trim(), $options: "i" } },
        ];
    }

    const staff = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: staff.length, staff });
};

// @desc Invite a new Administrator
// @route POST /api/admin/staff/invite
const inviteManager = async (req, res) => {
    const { name, email, phone, role } = req.body;

    if (!name || !email) {
        return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
        return res.status(409).json({ success: false, message: "A user with this email already exists" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const inviteExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const assignedRole = role === "delivery_partner" ? "delivery_partner" : "admin";

    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone || "",
        role: assignedRole,
        status: "invited",
        inviteTokenHash: tokenHash,
        inviteExpiresAt,
        invitedBy: req.user._id,
    });

    const inviteUrl = `${getClientUrl()}/onboard?token=${rawToken}`;

    res.status(201).json({
        success: true,
        message: "Invitation generated successfully",
        inviteUrl,
        token: rawToken,
        user,
    });
};

// @desc Resend / regenerate invite link (Owner only)
// @route POST /api/admin/staff/:id/resend-invite
const resendInvite = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.status !== "invited") {
        return res.status(400).json({ success: false, message: "User has already activated their account" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.inviteTokenHash = tokenHash;
    user.inviteExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await user.save();

    const inviteUrl = `${getClientUrl()}/onboard?token=${rawToken}`;

    res.status(200).json({
        success: true,
        message: "New invitation link generated",
        inviteUrl,
        token: rawToken,
    });
};

// @desc Update staff status (active / suspended)
// @route PATCH /api/admin/staff/:id/status
const updateStaffStatus = async (req, res) => {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
        return res.status(400).json({ success: false, message: "Status must be 'active' or 'suspended'" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
        return res.status(404).json({ success: false, message: "Staff user not found" });
    }

    // Cannot suspend self
    if (String(targetUser._id) === String(req.user._id)) {
        return res.status(400).json({ success: false, message: "You cannot change your own status" });
    }

    // Check if suspending the last active administrator
    if ((targetUser.role === "admin" || targetUser.role === "owner") && status === "suspended") {
        const activeAdmins = await User.countDocuments({
            role: { $in: ["admin", "owner"] },
            status: "active",
            _id: { $ne: targetUser._id },
        });
        if (activeAdmins === 0) {
            return res.status(400).json({ success: false, message: "Cannot suspend the only remaining active administrator" });
        }
    }

    targetUser.status = status;

    // If suspending a partner: set offline and unassign 'preparing' orders
    if (targetUser.role === "delivery_partner" && status === "suspended") {
        if (!targetUser.deliveryProfile) targetUser.deliveryProfile = {};
        targetUser.deliveryProfile.isOnline = false;

        // Unassign orders that are still preparing
        await Order.updateMany(
            {
                status: { $in: ["preparing", "Preparing", "placed", "Placed"] },
                $or: [{ assignedPartner: targetUser._id }, { "delivery.partner": targetUser._id }],
            },
            {
                $set: {
                    assignedPartner: null,
                    assignedAt: null,
                    "delivery.partner": null,
                    "delivery.assignedAt": null,
                    "delivery.acceptedAt": null,
                },
            }
        );
    }

    await targetUser.save();

    res.status(200).json({
        success: true,
        message: `${targetUser.name} status updated to ${status}`,
        user: targetUser,
    });
};

// @desc List partner applications
// @route GET /api/admin/partners
const getPartnerApplications = async (req, res) => {
    const { status } = req.query;
    const query = { role: "delivery_partner" };
    if (status && status !== "all") {
        query.status = status;
    }

    const partners = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: partners.length, partners });
};

// @desc Approve delivery partner application
// @route PATCH /api/admin/partners/:id/approve
const approvePartner = async (req, res) => {
    const partner = await User.findById(req.params.id);
    if (!partner || partner.role !== "delivery_partner") {
        return res.status(404).json({ success: false, message: "Delivery partner application not found" });
    }

    partner.status = "active";
    if (!partner.deliveryProfile) partner.deliveryProfile = {};
    partner.deliveryProfile.reviewedBy = req.user._id;
    partner.deliveryProfile.reviewedAt = new Date();
    partner.deliveryProfile.rejectionReason = "";

    await partner.save();

    res.status(200).json({
        success: true,
        message: `${partner.name} approved as delivery partner`,
        partner,
    });
};

// @desc Reject delivery partner application
// @route PATCH /api/admin/partners/:id/reject
const rejectPartner = async (req, res) => {
    const { reason } = req.body;
    const partner = await User.findById(req.params.id);
    if (!partner || partner.role !== "delivery_partner") {
        return res.status(404).json({ success: false, message: "Delivery partner application not found" });
    }

    partner.status = "rejected";
    if (!partner.deliveryProfile) partner.deliveryProfile = {};
    partner.deliveryProfile.reviewedBy = req.user._id;
    partner.deliveryProfile.reviewedAt = new Date();
    partner.deliveryProfile.rejectionReason = reason || "Application did not meet requirements";

    await partner.save();

    res.status(200).json({
        success: true,
        message: `Application for ${partner.name} marked as rejected`,
        partner,
    });
};

module.exports = {
    getStaff,
    inviteManager,
    resendInvite,
    updateStaffStatus,
    getPartnerApplications,
    approvePartner,
    rejectPartner,
};
