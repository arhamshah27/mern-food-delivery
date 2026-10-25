const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const foodRoutes = require("./routes/foodRoutes");
const addOnRoutes = require("./routes/addOnRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const settingRoutes = require("./routes/settingRoutes");
const onboardRoutes = require("./routes/onboardRoutes");
const staffRoutes = require("./routes/staffRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notFound = require("./middlewares/notFoundMiddleware");
const errorHandler = require("./middlewares/errorMiddleware");

const path = require("path");

const app = express();

// Serve local uploaded files as fallback
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ─── Security Headers ──────────────────────────────────────────────
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// ─── CORS ──────────────────────────────────────────────────────────
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, etc.) or any localhost port or CLIENT_URL
            if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) || origin === process.env.CLIENT_URL) {
                callback(null, true);
            } else {
                callback(null, true); // Permissive in dev so testing never breaks
            }
        },
        credentials: true, // Required for cookies
    })
);

// ─── Rate Limiting ─────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests — please try again later",
    },
});
app.use("/api", limiter);

// ─── Body Parsers ──────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Fresh Data (No Store) ─────────────────────────────────────────
app.use((_req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    next();
});

// ─── Health Check ──────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        environment: process.env.NODE_ENV,
    });
});

// ─── API Routes ────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/onboard", onboardRoutes);
app.use("/api/admin/staff", staffRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/addons", addOnRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);

// ─── 404 & Error Handling ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
