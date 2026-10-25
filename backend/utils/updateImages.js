const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const FoodItem = require("../models/FoodItem");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const updates = [
    {
      name: "Paneer Tikka Angara",
      image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Murgh Malai Tikka",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Crispy Corn & Water Chestnut Salt 'n Pepper",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Paneer Butter Masala (Royal Chef Special)",
      image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Dal Makhani 24-Hour Slow Cook",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Butter Chicken (Old Delhi Classic)",
      image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Royal Dum Subz Biryani",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Nawabi Dum Chicken Biryani",
      image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Garlic Butter Naan",
      image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Kesar Pista Gulab Jamun (2 Pcs)",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    },
  ];

  for (const item of updates) {
    const res = await FoodItem.updateOne({ name: item.name }, { $set: { image: item.image } });
    console.log(`Updated "${item.name}":`, res.modifiedCount);
  }

  console.log("All food images updated successfully!");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
