const Order = require("../models/Order");
const User = require("../models/User");

// @desc Get real-time restaurant dashboard stats
// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
    const { range = "7d" } = req.query; // 'today', '7d', '30d'

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Today's orders
    const todayOrdersCount = await Order.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Today's revenue (delivered or valid non-cancelled orders)
    const todayRevenueAgg = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: todayStart, $lte: todayEnd },
                status: { $nin: ["Cancelled", "cancelled"] },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$totalAmount" },
            },
        },
    ]);
    const todayRevenue = todayRevenueAgg.length > 0 ? todayRevenueAgg[0].total : 0;
    const avgOrderValue = todayOrdersCount > 0 ? Math.round(todayRevenue / todayOrdersCount) : 0;

    // Active deliveries
    const activeDeliveries = await Order.countDocuments({
        status: { $in: ["out_for_delivery", "Out for delivery"] },
    });

    // Pending partner applications
    const pendingApplications = await User.countDocuments({
        role: "delivery_partner",
        status: "pending",
    });

    // Delivered orders count
    const deliveredOrdersCount = await Order.countDocuments({
        status: { $in: ["Delivered", "delivered"] },
    });

    // Pending orders (in kitchen preparation)
    const pendingOrdersCount = await Order.countDocuments({
        status: { $in: ["Placed", "placed", "Preparing", "preparing"] },
    });

    // Recent orders (last 6)
    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select("orderNumber customerDetails items totalAmount status paymentMethod createdAt");

    // Status summary counts
    const statusSummary = {
        Placed: await Order.countDocuments({ status: { $in: ["Placed", "placed"] } }),
        Preparing: await Order.countDocuments({ status: { $in: ["Preparing", "preparing"] } }),
        OutForDelivery: activeDeliveries,
        Delivered: deliveredOrdersCount,
        Cancelled: await Order.countDocuments({ status: { $in: ["Cancelled", "cancelled"] } }),
    };

    // Revenue Trend by Day (7 or 30 days)
    const daysCount = range === "30d" ? 30 : range === "today" ? 1 : 7;
    const trendStart = new Date();
    trendStart.setDate(trendStart.getDate() - (daysCount - 1));
    trendStart.setHours(0, 0, 0, 0);

    const revenueTrendAgg = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: trendStart },
                status: { $nin: ["Cancelled", "cancelled"] },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Build continuous date array
    const trendMap = new Map(revenueTrendAgg.map((item) => [item._id, item]));
    const revenueTrend = [];
    for (let i = 0; i < daysCount; i++) {
        const d = new Date(trendStart);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split("T")[0];
        const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        const entry = trendMap.get(key) || { revenue: 0, orders: 0 };
        revenueTrend.push({
            date: label,
            rawDate: key,
            revenue: entry.revenue,
            orders: entry.orders,
        });
    }

    // Top-selling dishes aggregation
    const topDishesAgg = await Order.aggregate([
        { $match: { status: { $nin: ["Cancelled", "cancelled"] } } },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.name",
                totalQuantity: { $sum: "$items.quantity" },
                totalRevenue: { $sum: "$items.itemTotal" },
                image: { $first: "$items.image" },
                foodType: { $first: "$items.foodType" },
            },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
    ]);

    res.status(200).json({
        success: true,
        stats: {
            todayOrders: todayOrdersCount,
            todayRevenue,
            avgOrderValue,
            activeDeliveries,
            pendingApplications,
            pendingOrders: pendingOrdersCount,
            deliveredOrders: deliveredOrdersCount,
        },
        statusSummary,
        recentOrders,
        revenueTrend,
        topDishes: topDishesAgg,
    });
};

module.exports = { getDashboardStats };
