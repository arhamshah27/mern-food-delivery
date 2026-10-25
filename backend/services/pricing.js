const FoodItem = require("../models/FoodItem");
const Coupon = require("../models/Coupon");
const Setting = require("../models/Setting");

function round2(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

function validateCoupon(coupon, subtotal) {
    if (!coupon) return "Invalid coupon code";
    if (!coupon.isActive) return "Coupon is no longer active";
    const expiry = coupon.expirationDate || coupon.validUntil;
    if (expiry && new Date(expiry) < new Date()) {
        return "Coupon has expired";
    }
    const minOrder = coupon.minimumOrder || coupon.minOrderAmount || 0;
    if (minOrder && subtotal < minOrder) {
        return `Minimum order of ₹${minOrder} required for this coupon`;
    }
    return null;
}

function computeDiscount(coupon, subtotal) {
    if (!coupon) return 0;
    let disc = 0;
    const val = coupon.discountValue || coupon.discountAmount || 0;
    const type = (coupon.discountType || "").toLowerCase();

    if (type === "percentage") {
        disc = (subtotal * val) / 100;
        if (coupon.maxDiscount && disc > coupon.maxDiscount) {
            disc = coupon.maxDiscount;
        }
    } else {
        disc = val;
    }
    return round2(Math.min(disc, subtotal));
}

/**
 * Price cart items against current database state.
 * @param {Array<{foodItemId:string, quantity:number, selectedAddOns:Array<{addOn:string, price:number}>}>} cartItems
 * @param {string|null} couponCode
 * @param {object} options
 */
async function priceCart(cartItems = [], couponCode = null, { strict = false } = {}) {
    let settings = await Setting.findOne();
    if (!settings) {
        settings = {
            taxPercentage: 5,
            deliveryCharge: 40,
            freeDeliveryAbove: 499,
            minimumOrderAmount: 150,
            isOpen: true,
        };
    }

    const ids = cartItems.map((i) => i.foodItemId || i.foodId || i._id).filter(Boolean);
    const foods = await FoodItem.find({ _id: { $in: ids } }).populate("category");
    const byId = new Map(foods.map((f) => [f._id.toString(), f]));

    const lines = [];
    const warnings = [];

    for (const item of cartItems) {
        const id = (item.foodItemId || item.foodId || item._id || "").toString();
        const food = byId.get(id);

        if (!food) {
            warnings.push({ id, message: "Dish no longer exists" });
            continue;
        }

        if (!food.isAvailable) {
            warnings.push({ id, message: `${food.name} is currently out of stock` });
            if (strict) continue;
        }

        const qty = Math.min(Math.max(parseInt(item.quantity, 10) || 1, 1), 50);
        let addOnsTotal = 0;
        const addOnsList = [];

        if (Array.isArray(item.selectedAddOns)) {
            for (const addOn of item.selectedAddOns) {
                const addOnPrice = parseFloat(addOn.price) || 0;
                addOnsTotal += addOnPrice;
                addOnsList.push({
                    name: addOn.name,
                    price: addOnPrice,
                });
            }
        }

        const unitPrice = round2(food.price + addOnsTotal);
        const lineTotal = round2(unitPrice * qty);

        lines.push({
            foodItem: food._id,
            name: food.name,
            foodType: food.foodType,
            image: food.image,
            price: food.price,
            unitPrice,
            quantity: qty,
            selectedAddOns: addOnsList,
            itemTotal: lineTotal,
        });
    }

    const subtotal = round2(lines.reduce((acc, l) => acc + l.itemTotal, 0));

    let discount = 0;
    let coupon = null;
    let couponError = null;

    if (couponCode) {
        coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
        couponError = validateCoupon(coupon, subtotal);
        if (couponError) {
            coupon = null;
        } else {
            discount = computeDiscount(coupon, subtotal);
        }
    }

    const afterDiscount = round2(Math.max(subtotal - discount, 0));
    const tax = round2(afterDiscount * ((settings.taxPercentage || 5) / 100));
    const freeDelivery = settings.freeDeliveryAbove > 0 && subtotal >= settings.freeDeliveryAbove;
    const deliveryCharge = lines.length === 0 || freeDelivery ? 0 : round2(settings.deliveryCharge || 40);
    const totalAmount = round2(afterDiscount + tax + deliveryCharge);

    return {
        lines,
        subtotal,
        discount,
        couponCode: coupon ? coupon.code : null,
        couponError,
        tax,
        deliveryCharge,
        freeDelivery,
        freeDeliveryAbove: settings.freeDeliveryAbove || 499,
        totalAmount,
        minimumOrderAmount: settings.minimumOrderAmount || 150,
        meetsMinimumOrder: subtotal >= (settings.minimumOrderAmount || 150),
        isOpen: settings.isOpen !== false,
        warnings,
    };
}

module.exports = {
    round2,
    priceCart,
    validateCoupon,
    computeDiscount,
};
