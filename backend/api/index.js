const app = require("../app");
const connectDB = require("../config/db");
const { connectCloudinary } = require("../config/cloudinary");

// Configure Cloudinary once
try {
    connectCloudinary();
} catch (err) {
    console.error("Cloudinary init warning:", err.message);
}

module.exports = async (req, res) => {
    try {
        await connectDB();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: err.message,
        });
    }
    return app(req, res);
};
