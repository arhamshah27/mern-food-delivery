#!/usr/bin/env node

/**
 * Rider Simulator Script
 * Usage: npm run simulate-rider -- <orderId>
 * or: node scripts/simulateRider.js <orderId>
 */

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const API_URL = process.env.API_URL || "http://localhost:5000/api";
const targetOrderId = process.argv[2];

if (!targetOrderId) {
    console.error("❌ Please provide an order ID or orderNumber:");
    console.error("   Example: npm run simulate-rider -- ORD-1234");
    process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSimulation() {
    console.log(`🚀 Starting Rider Simulation for Order: ${targetOrderId}`);
    console.log(`   Connecting to API at: ${API_URL}`);

    // 1. Ensure order is assigned to rider (using manager credentials)
    console.log("👔 Verifying order assignment via shop manager...");
    const mgrRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "manager@demo.com", password: "Demo@1234" }),
    });
    const mgrData = await mgrRes.json();
    const mgrHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mgrData.token}`,
    };

    const orderRes = await fetch(`${API_URL}/orders/${targetOrderId}`, {
        headers: mgrHeaders,
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.order) {
        console.error("❌ Could not find order:", orderData.message);
        process.exit(1);
    }
    const order = orderData.order;
    console.log(`📦 Order loaded: #${order.orderNumber} (Current status: ${order.status})`);

    // 2. Log in as delivery partner
    console.log("🔑 Authenticating as rider@demo.com...");
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "rider@demo.com", password: "Demo@1234" }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
        console.error("❌ Authentication failed:", loginData.message);
        process.exit(1);
    }

    const token = loginData.token;
    const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    console.log(`✅ Logged in as ${loginData.user.name} (${loginData.user.role})`);

    // Assign to rider if not yet assigned
    if (!order.delivery?.partner && !order.assignedPartner) {
        console.log("ℹ️ Assigning order to rider@demo.com...");
        await fetch(`${API_URL}/orders/${order._id}/assign`, {
            method: "PATCH",
            headers: mgrHeaders,
            body: JSON.stringify({ partnerId: loginData.user._id }),
        });
    }
    // If placed, move to preparing via manager
    if (order.status === "Placed" || order.status === "placed") {
        console.log("🍳 Kitchen is preparing the order...");
        await fetch(`${API_URL}/orders/${order._id}/status`, {
            method: "PATCH",
            headers: mgrHeaders,
            body: JSON.stringify({ status: "preparing" }),
        });
    }

    // Accept order if not accepted
    console.log("🛵 Accepting order assignment...");
    await fetch(`${API_URL}/delivery/orders/${order._id}/accept`, {
        method: "PATCH",
        headers: authHeaders,
    });

    // Mark out for delivery
    console.log("📍 Marking Out for delivery...");
    await fetch(`${API_URL}/delivery/orders/${order._id}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: "out_for_delivery" }),
    });

    // Calculate coordinates for route
    const startLat = 22.3072;
    const startLng = 73.1812;
    const destLat = order.addressDetails?.lat || 22.3250;
    const destLng = order.addressDetails?.lng || 73.1950;

    const steps = 15;
    console.log(`🗺️ Simulating live GPS movement across ${steps} waypoints (3s intervals)...`);
    console.log(`   From: [${startLat}, ${startLng}] -> To: [${destLat}, ${destLng}]`);

    for (let i = 1; i <= steps; i++) {
        const progress = i / steps;
        const curLat = startLat + (destLat - startLat) * progress;
        const curLng = startLng + (destLng - startLng) * progress;

        const locRes = await fetch(`${API_URL}/delivery/orders/${order._id}/location`, {
            method: "PATCH",
            headers: authHeaders,
            body: JSON.stringify({ lat: curLat, lng: curLng }),
        });

        const locData = await locRes.json();
        const percent = Math.round(progress * 100);
        console.log(`   [${percent}%] GPS ping sent: [${curLat.toFixed(4)}, ${curLng.toFixed(4)}] (${i}/${steps})`);

        if (i < steps) {
            await sleep(3000);
        }
    }

    // If COD, mark cash collected
    if (order.paymentMethod === "COD" || order.paymentMethod === "cod") {
        console.log(`💵 Order is COD — Recording cash collection of ₹${order.totalAmount}...`);
        await fetch(`${API_URL}/delivery/orders/${order._id}/cash-collected`, {
            method: "PATCH",
            headers: authHeaders,
        });
    }

    // Mark Delivered
    console.log("🏁 Reached destination! Marking order as Delivered...");
    const deliverRes = await fetch(`${API_URL}/delivery/orders/${order._id}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: "delivered" }),
    });
    const deliverData = await deliverRes.json();

    if (deliverRes.ok && deliverData.success) {
        console.log(`🎉 SUCCESS! Order #${order.orderNumber} successfully delivered!`);
    } else {
        console.error("⚠️ Failed to mark delivered:", deliverData.message);
    }
}

runSimulation().catch((err) => {
    console.error("❌ Simulation error:", err.message);
    process.exit(1);
});
