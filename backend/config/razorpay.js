require("dotenv").config();
const Razorpay = require("razorpay");

let instance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("💳 Razorpay configured in test mode");
} else {
    console.log("ℹ️  Razorpay keys not provided; running in simulated test mode");
}

module.exports = instance;
