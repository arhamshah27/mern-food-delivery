const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const pointSchema = new mongoose.Schema(
    { lat: Number, lng: Number, at: Date },
    { _id: false }
);

const addressSchema = new mongoose.Schema({
    label: { type: String, default: "Home" },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: { type: Number, default: 22.3072 },
    lng: { type: Number, default: 73.1812 },
    isDefault: { type: Boolean, default: false },
});

const documentSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ["licence", "id_proof", "photo"], required: true },
        url: { type: String, required: true },
    },
    { _id: false }
);

const deliveryProfileSchema = new mongoose.Schema(
    {
        vehicleType: { type: String, enum: ["bike", "scooter", "cycle"], default: "bike" },
        vehicleNumber: { type: String, default: "" },
        licenceNumber: { type: String, default: "" },
        documents: [documentSchema],
        shift: { type: String, enum: ["morning", "evening", "full_day"], default: "full_day" },
        isOnline: { type: Boolean, default: false },
        lastLocation: pointSchema,
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewedAt: Date,
        rejectionReason: String,
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address",
            ],
        },
        password: {
            type: String,
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // Never return password in queries by default
        },
        passwordHash: {
            type: String,
            select: false,
        },
        profileImage: {
            type: String,
            default: "",
        },
        cloudinaryPublicId: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ["customer", "admin", "delivery_partner"],
            default: "customer",
            index: true,
        },
        status: {
            type: String,
            enum: ["invited", "pending", "active", "rejected", "suspended"],
            default: "active",
            index: true,
        },
        inviteTokenHash: {
            type: String,
            select: false,
        },
        inviteExpiresAt: Date,
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        phone: {
            type: String,
            default: "",
        },
        address: {
            type: String,
            default: "",
        },
        addresses: [addressSchema],
        deliveryProfile: deliveryProfileSchema,
    },
    {
        timestamps: true,
    }
);

/**
 * Pre-save hook — hash the password only when it has been modified.
 */
userSchema.pre("save", async function () {
    if (this.isModified("password") && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.passwordHash = this.password;
    }
});

/**
 * Instance method to set password directly
 */
userSchema.methods.setPassword = async function (plain) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plain, salt);
    this.password = hash;
    this.passwordHash = hash;
};

/**
 * Instance method — compare a candidate password against stored hash.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    const hashToCompare = this.password || this.passwordHash;
    if (!hashToCompare) return false;
    return bcrypt.compare(candidatePassword, hashToCompare);
};

/**
 * JSON transform — strip sensitive fields.
 */
userSchema.set("toJSON", {
    transform(_doc, ret) {
        delete ret.password;
        delete ret.passwordHash;
        delete ret.inviteTokenHash;
        delete ret.__v;
        return ret;
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
