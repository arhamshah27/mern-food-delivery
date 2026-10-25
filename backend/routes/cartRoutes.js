const express = require("express");
const router = express.Router();
const { priceCart } = require("../services/pricing");

/**
 * @desc Get real-time cart pricing quote from server
 * @route POST /api/cart/quote
 * @access Public
 */
router.post("/quote", async (req, res) => {
    try {
        const { items = [], couponCode = null } = req.body;
        const quote = await priceCart(items, couponCode, { strict: false });
        res.status(200).json({
            success: true,
            quote,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to calculate cart quote: " + err.message,
        });
    }
});

module.exports = router;
