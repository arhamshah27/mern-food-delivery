const fs = require("fs");
const path = require("path");
const { cloudinary } = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer, folder = "restaurant_assets") => {
    return new Promise((resolve) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (!error && result && result.secure_url) {
                    return resolve(result);
                }

                console.warn(
                    `⚠️ Cloudinary upload rejected (${error?.message || "Unknown error"}). Falling back to local disk storage...`
                );

                // Fallback: save to public/uploads
                try {
                    const uploadsDir = path.join(__dirname, "../public/uploads");
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                    }
                    const ext = "png";
                    const filename = `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
                    const filepath = path.join(uploadsDir, filename);

                    fs.writeFileSync(filepath, fileBuffer);

                    const localUrl = `http://localhost:5000/uploads/${filename}`;
                    resolve({
                        secure_url: localUrl,
                        public_id: `local_${filename}`,
                    });
                } catch (localErr) {
                    console.error("Local disk fallback failed:", localErr);
                    resolve({
                        secure_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
                        public_id: "default_fallback",
                    });
                }
            }
        );
        stream.end(fileBuffer);
    });
};

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    if (publicId.startsWith("local_")) {
        try {
            const filename = publicId.replace("local_", "");
            const filepath = path.join(__dirname, "../public/uploads", filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        } catch {
            // Ignore cleanup error
        }
        return;
    }
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error("Cloudinary asset deletion failed:", err.message);
    }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
