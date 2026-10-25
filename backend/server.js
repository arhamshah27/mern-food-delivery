/**
 * Server entry point.
 *
 * 1. Load environment variables.
 * 2. Connect to MongoDB.
 * 3. Configure Cloudinary.
 * 4. Start the HTTP server ONLY after the database connection succeeds.
 */

require("dotenv").config();

// Force Node.js to use Google DNS — fixes SRV lookup failures on some ISP/network DNS servers
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = require("./app");
const connectDB = require("./config/db");
const { connectCloudinary } = require("./config/cloudinary");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Database first — if this fails, process.exit(1) in connectDB stops everything
    await connectDB();

    // Migrate any legacy roles ('owner', 'shop_manager') to 'admin'
    try {
        const User = require("./models/User");
        const result = await User.updateMany(
            { role: { $in: ["owner", "shop_manager"] } },
            { $set: { role: "admin" } }
        );
        if (result.modifiedCount > 0) {
            console.log(`🔄 Migrated ${result.modifiedCount} legacy user(s) to 'admin' role.`);
        }
    } catch (migErr) {
        console.error("Role migration error:", migErr.message);
    }

    // Configure Cloudinary SDK
    connectCloudinary();

    app.listen(PORT, () => {
        console.log(
            `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
        );
    });
};

startServer();
