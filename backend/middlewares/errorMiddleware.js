/**
 * Centralized error-handling middleware.
 *
 * Express recognises a middleware with 4 parameters as an error handler.
 * Any `next(error)` call or thrown error in async controllers lands here.
 */

const multer = require("multer");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // ── Multer errors ────────────────────────────────────────────────
    if (err instanceof multer.MulterError) {
        statusCode = 400;
        if (err.code === "LIMIT_FILE_SIZE") {
            statusCode = 413;
            message = "File too large — maximum size is 5 MB";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = err.field || "Unexpected file type";
        } else {
            message = `Upload error: ${err.message}`;
        }
    }

    // ── Mongoose validation errors ───────────────────────────────────
    if (err.name === "ValidationError") {
        statusCode = 400;
        const messages = Object.values(err.errors).map((e) => e.message);
        message = messages.join(". ");
    }

    // ── Mongoose duplicate key (E11000) ──────────────────────────────
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue).join(", ");
        message = `Duplicate value for: ${field}`;
    }

    // ── Mongoose bad ObjectId ────────────────────────────────────────
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    // Never expose stack traces or internal details in production
    const response = {
        success: false,
        message,
    };

    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
