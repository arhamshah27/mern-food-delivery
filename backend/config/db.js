const mongoose = require("mongoose");
const dns = require("dns");

try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
    // ignore
}

/**
 * Connect to MongoDB Atlas.
 * Caches the connection in serverless environments (Vercel) to reuse across lambda invocations.
 */
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error(
            "💡 Tip: Make sure your IP is whitelisted in MongoDB Atlas → Network Access (set to 0.0.0.0/0 for Vercel/cloud deployments)."
        );
        if (!process.env.VERCEL) {
            process.exit(1);
        } else {
            throw error;
        }
    }
};

module.exports = connectDB;
