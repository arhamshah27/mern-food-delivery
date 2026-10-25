const cloudinary = require("cloudinary").v2;

/**
 * Configure the Cloudinary SDK with credentials from environment variables.
 * Must be called once at application startup before any uploads.
 */
const connectCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("☁️  Cloudinary configured");
};

module.exports = { cloudinary, connectCloudinary };
