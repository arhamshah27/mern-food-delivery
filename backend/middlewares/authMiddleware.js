const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { can } = require("../config/permissions");

/**
 * Authentication middleware — protects routes that require a logged-in user.
 *
 * Token resolution order:
 *   1. HttpOnly cookie named "token"
 *   2. Authorization: Bearer <token> header
 *
 * On success, attaches the fresh user document to `req.user`.
 */
const protect = async (req, res, next) => {
    let token;

    // 1. Try cookie first (preferred for browser clients)
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    // 2. Fallback to Authorization header
    else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized — no token provided",
        });
    }

    // Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired — please log in again",
            });
        }
        return res.status(401).json({
            success: false,
            message: "Not authorized — invalid token",
        });
    }

    const userId = decoded.id || decoded.sub;
    // Re-read user from DB on every request to check active role & status
    const user = await User.findById(userId);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Not authorized — user no longer exists",
        });
    }

    if (user.status === "suspended") {
        return res.status(403).json({
            success: false,
            message: "Your account has been suspended",
        });
    }

    req.user = user;
    next();
};

/**
 * Authorize middleware — checks if the authenticated user has any of the required permissions.
 */
const authorize = (...permissions) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    if (req.user.status !== "active") {
        return res.status(403).json({
            success: false,
            message: "Your account is not active yet",
        });
    }

    const hasPermission = permissions.some((p) => can(req.user.role, p));
    if (!hasPermission) {
        return res.status(403).json({
            success: false,
            message: "Access denied — insufficient permissions",
        });
    }

    next();
};

/**
 * Require specific roles
 */
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: `Access denied: requires one of [${roles.join(", ")}]`,
        });
    }

    next();
};

/**
 * Admin authorization middleware (Owner, Shop Manager, or legacy Admin)
 */
const adminOnly = (req, res, next) => {
    const adminRoles = ["owner", "shop_manager", "admin"];
    if (req.user && adminRoles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: "Access denied: Staff privileges required",
        });
    }
};

module.exports = {
    protect,
    auth: protect,
    authorize,
    requireRole,
    adminOnly,
};
