const multer = require("multer");

/**
 * Multer configuration using MEMORY storage.
 *
 * Why memory storage?
 *   - We upload directly from the buffer to Cloudinary.
 *   - No temporary files are written to disk, so there is nothing to clean up.
 *
 * Security measures:
 *   - Only specific image MIME types are accepted.
 *   - File size is capped at 5 MB.
 */

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new multer.MulterError(
                "LIMIT_UNEXPECTED_FILE",
                `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, GIF`
            ),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = upload;
