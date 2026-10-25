const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const dns = require("dns");

try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
    // ignore
}
dotenv.config();

const User = require("../models/User");
const Category = require("../models/Category");
const FoodItem = require("../models/FoodItem");
const AddOn = require("../models/AddOn");
const Banner = require("../models/Banner");
const Coupon = require("../models/Coupon");
const Setting = require("../models/Setting");

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        // 1. Seed Demo Role Users
        const demoUsers = [
            {
                name: "Restaurant Owner",
                email: "owner@demo.com",
                password: "Demo@1234",
                role: "admin",
                status: "active",
                phone: "+91 98765 00001",
                address: "Baroda Gourmet Kitchen, Alkapuri",
            },
            {
                name: "Shop Manager",
                email: "manager@demo.com",
                password: "Demo@1234",
                role: "admin",
                status: "active",
                phone: "+91 98765 00002",
                address: "Kitchen Operations, Alkapuri",
            },
            {
                name: "Rider Ramesh",
                email: "rider@demo.com",
                password: "Demo@1234",
                role: "delivery_partner",
                status: "active",
                phone: "+91 98765 00003",
                address: "Sayajigunj, Vadodara",
                deliveryProfile: {
                    vehicleType: "bike",
                    vehicleNumber: "GJ-06-AB-1234",
                    licenceNumber: "DL-GJ06-2023-0098",
                    isOnline: true,
                    shift: "full_day",
                    lastLocation: { lat: 22.3100, lng: 73.1850, at: new Date() },
                },
            },
            {
                name: "Rider Suresh (Applicant)",
                email: "rider2@demo.com",
                password: "Demo@1234",
                role: "delivery_partner",
                status: "pending",
                phone: "+91 98765 00004",
                address: "Fatehgunj, Vadodara",
                deliveryProfile: {
                    vehicleType: "scooter",
                    vehicleNumber: "GJ-06-CD-5678",
                    isOnline: false,
                },
            },
            {
                name: "Pooja Patel",
                email: "customer@demo.com",
                password: "Demo@1234",
                role: "customer",
                status: "active",
                phone: "+91 98765 00005",
                address: "Flat 402, Royal Residency, Alkapuri, Vadodara",
                addresses: [
                    {
                        label: "Home",
                        line1: "Flat 402, Royal Residency",
                        city: "Vadodara",
                        pincode: "390007",
                        lat: 22.3120,
                        lng: 73.1780,
                        isDefault: true,
                    },
                ],
            },
            {
                name: "Executive Chef & Admin",
                email: "admin@barodagourmet.com",
                password: "Admin@123",
                role: "admin",
                status: "active",
                phone: "+91 98765 00000",
                address: "Baroda Gourmet Kitchen, Alkapuri",
            },
        ];

        for (const u of demoUsers) {
            const existing = await User.findOne({ email: u.email });
            if (!existing) {
                await User.create(u);
                console.log(`✅ User seeded: ${u.email} (${u.role})`);
            }
        }

        // 2. Seed Settings
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({
                restaurantName: "Baroda Gourmet Kitchen",
                tagline: "Authentic Delicacies, Modern Gastronomy",
                phone: "+91 98765 43210",
                email: "order@barodagourmet.com",
                address: "14 Alkapuri Main Boulevard, Vadodara, Gujarat 390007",
                openingTime: "10:00 AM",
                closingTime: "11:30 PM",
                workingDays: "Monday - Sunday",
                isOpen: true,
                deliveryCharge: 40,
                taxPercentage: 5,
                minimumOrderAmount: 150,
            });
            console.log("✅ Restaurant settings initialized");
        }

        // 3. Seed Banners if empty
        const bannerCount = await Banner.countDocuments();
        if (bannerCount === 0) {
            await Banner.create([
                {
                    title: "Royal Flavors of Gujarat & Beyond",
                    subtitle: "Handcrafted artisan curries, slow-cooked biryanis & tandoori delights.",
                    buttonText: "Explore Signature Menu",
                    buttonLink: "/menu",
                    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=80",
                    isActive: true,
                    displayOrder: 1,
                },
                {
                    title: "Flat 25% Off On Your First Feast",
                    subtitle: "Use coupon code WELCOME25 on orders above ₹400.",
                    buttonText: "Order Now",
                    buttonLink: "/menu",
                    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80",
                    isActive: true,
                    displayOrder: 2,
                },
            ]);
            console.log("✅ Promotional banners seeded");
        }

        // 4. Seed Categories if empty
        let categories = await Category.find();
        if (categories.length === 0) {
            categories = await Category.create([
                {
                    name: "Starters & Appetizers",
                    description: "Crispy bites, kebabs, and authentic street flavors",
                    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80",
                    isActive: true,
                },
                {
                    name: "Signature Main Course",
                    description: "Rich aromatic gravies, cottage cheese specialties, and tandoori mains",
                    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
                    isActive: true,
                },
                {
                    name: "Biryani & Rice Bowls",
                    description: "Dum-cooked fragrant basmati rice layered with herbs & saffron",
                    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
                    isActive: true,
                },
                {
                    name: "Artisanal Breads",
                    description: "Clay oven butter naans, garlic kulchas, and laccha parathas",
                    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80",
                    isActive: true,
                },
                {
                    name: "Desserts & Beverages",
                    description: "Gulab jamuns, saffron lassi, mocktails, and decadent sweets",
                    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
                    isActive: true,
                },
            ]);
            console.log("✅ Categories seeded");
        }

        // 5. Seed Add-ons if empty
        let addOns = await AddOn.find();
        if (addOns.length === 0) {
            addOns = await AddOn.create([
                { name: "Extra Pure Desi Ghee", description: "Rich dollop of clarified butter", price: 30, isAvailable: true },
                { name: "Spicy Mint & Coriander Chutney", description: "Freshly ground herbal dip", price: 25, isAvailable: true },
                { name: "Crispy Roasted Papad & Pickle", description: "Crunchy lentil wafer with spicy mango relish", price: 35, isAvailable: true },
                { name: "Melted Cheese Glaze", description: "Warm creamy cheddar cheese topping", price: 50, isAvailable: true },
                { name: "Boondi Raita (100ml)", description: "Chilled spiced yogurt with crispy chickpea beads", price: 45, isAvailable: true },
            ]);
            console.log("✅ Add-ons seeded");
        }

        // 6. Seed Food Items if empty
        const foodCount = await FoodItem.countDocuments();
        if (foodCount === 0) {
            const starterCat = categories.find((c) => c.name.includes("Starters"))?._id;
            const mainCat = categories.find((c) => c.name.includes("Signature Main"))?._id;
            const biryaniCat = categories.find((c) => c.name.includes("Biryani"))?._id;
            const breadCat = categories.find((c) => c.name.includes("Breads"))?._id;
            const dessertCat = categories.find((c) => c.name.includes("Desserts"))?._id;

            const addOnIds = addOns.map((a) => a._id);

            await FoodItem.create([
                {
                    name: "Paneer Tikka Angara",
                    description: "Tender cottage cheese cubes marinated in smoked tandoori spices with charred bell peppers.",
                    category: starterCat,
                    price: 280,
                    foodType: "veg",
                    preparationTime: 20,
                    isPopular: true,
                    isAvailable: true,
                    image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80",
                    addOns: [addOnIds[1], addOnIds[2]],
                },
                {
                    name: "Crispy Corn & Water Chestnut Salt 'n Pepper",
                    description: "Golden fried sweet corn kernels tossed with crushed black pepper, spring onions, and garlic.",
                    category: starterCat,
                    price: 240,
                    foodType: "veg",
                    preparationTime: 15,
                    isPopular: false,
                    isAvailable: true,
                    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
                    addOns: [addOnIds[1]],
                },
                {
                    name: "Murgh Malai Tikka",
                    description: "Juicy chicken chunks steeped in fresh cream, green cardamom, and mild cheese, grilled on charcoal.",
                    category: starterCat,
                    price: 340,
                    foodType: "non-veg",
                    preparationTime: 25,
                    isPopular: true,
                    isAvailable: true,
                    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
                    addOns: [addOnIds[1], addOnIds[2]],
                },
                {
                    name: "Paneer Butter Masala (Royal Chef Special)",
                    description: "Velvety butter gravy infused with Kashmiri chili, ripe tomatoes, cashews, and fresh cream.",
                    category: mainCat,
                    price: 320,
                    foodType: "veg",
                    preparationTime: 25,
                    isPopular: true,
                    isAvailable: true,
                    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
                    addOns: [addOnIds[0], addOnIds[3]],
                },
                {
                    name: "Dal Makhani 24-Hour Slow Cook",
                    description: "Whole black lentils slow-cooked overnight on charcoal embers with butter and plum tomatoes.",
                    category: mainCat,
                    price: 260,
                    foodType: "veg",
                    preparationTime: 20,
                    isPopular: true,
                    isAvailable: true,
                    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
                    addOns: [addOnIds[0], addOnIds[2]],
                },
                {
                    name: "Butter Chicken (Old Delhi Classic)",
                    description: "Charcoal-tandoor roasted chicken simmered in silky tomato, butter, and fenugreek gravy.",
                    category: mainCat,
                    price: 390,
                    foodType: "non-veg",
                    preparationTime: 30,
                    isPopular: true,
                    isAvailable: true,
                    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
                    addOns: [addOnIds[0]],
                },
                {
                    name: "Royal Dum Subz Biryani",
                    description: "Aromatic aged basmati rice cooked on dum with garden vegetables, saffron milk, and fried onions.",
                    category: biryaniCat,
                    price: 290,
                    foodType: "veg",
                    preparationTime: 25,
                    isPopular: true,
                    isAvailable: true,
                    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
                    addOns: [addOnIds[4], addOnIds[2]],
                },
                {
                    name: "Nawabi Dum Chicken Biryani",
                    description: "Succulent marinated chicken, mint, browned onions, and saffron layered between long-grain basmati rice.",
                    category: biryaniCat,
                    price: 380,
                    foodType: "non-veg",
                    preparationTime: 30,
                    isPopular: true,
                    isAvailable: true,
                    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
                    addOns: [addOnIds[4], addOnIds[1]],
                },
                {
                    name: "Garlic Butter Naan",
                    description: "Clay oven leavened white flatbread glazed with crushed roasted garlic and fresh dairy butter.",
                    category: breadCat,
                    price: 75,
                    foodType: "veg",
                    preparationTime: 10,
                    isPopular: false,
                    isAvailable: true,
                    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80",
                    addOns: [addOnIds[0], addOnIds[3]],
                },
                {
                    name: "Kesar Pista Gulab Jamun (2 Pcs)",
                    description: "Warm, melt-in-mouth milk dumplings soaked in saffron-scented cardamom sugar syrup.",
                    category: dessertCat,
                    price: 110,
                    foodType: "veg",
                    preparationTime: 10,
                    isPopular: true,
                    isAvailable: true,
                    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
                    addOns: [],
                },
            ]);
            console.log("✅ Food items seeded");
        }

        // 7. Seed Coupons if empty
        const couponCount = await Coupon.countDocuments();
        if (couponCount === 0) {
            await Coupon.create([
                {
                    code: "WELCOME25",
                    discountType: "percentage",
                    discountValue: 25,
                    minimumOrder: 400,
                    expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    usageLimit: 500,
                    isActive: true,
                },
                {
                    code: "FEAST100",
                    discountType: "fixed",
                    discountValue: 100,
                    minimumOrder: 600,
                    expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                    usageLimit: 200,
                    isActive: true,
                },
            ]);
            console.log("✅ Promotional coupons seeded");
        }

        console.log("🎉 Seeding complete successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedDatabase();
