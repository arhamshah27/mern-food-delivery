import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("baroda_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState({
    deliveryCharge: 40,
    taxPercentage: 5,
    minimumOrderAmount: 150,
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const savedCoupon = localStorage.getItem("baroda_coupon");
      return savedCoupon ? JSON.parse(savedCoupon) : null;
    } catch {
      return null;
    }
  });

  // Sync settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axiosInstance.get("/settings");
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch {
        // Fallback to defaults
      }
    };
    fetchSettings();
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("baroda_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist coupon
  useEffect(() => {
    if (coupon) {
      localStorage.setItem("baroda_coupon", JSON.stringify(coupon));
    } else {
      localStorage.removeItem("baroda_coupon");
    }
  }, [coupon]);

  // Generate unique item signature based on food ID + chosen add-ons
  const getItemKey = (foodId, selectedAddOns = []) => {
    const sortedAddOnIds = [...selectedAddOns]
      .map((a) => a._id || a)
      .sort()
      .join("-");
    return `${foodId}_${sortedAddOnIds}`;
  };

  const addToCart = (food, selectedAddOns = [], quantity = 1) => {
    if (!food.isAvailable) {
      toast.error(`${food.name} is currently out of stock`);
      return;
    }

    const itemKey = getItemKey(food._id, selectedAddOns);
    let addOnsTotal = selectedAddOns.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const unitPrice = Number(food.price) + addOnsTotal;

    const alreadyExists = cartItems.some((item) => item.itemKey === itemKey);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.itemKey === itemKey);

      if (existingIndex > -1) {
        return prevItems.map((item, idx) => {
          if (idx === existingIndex) {
            const newQty = item.quantity + quantity;
            return {
              ...item,
              quantity: newQty,
              itemTotal: newQty * unitPrice,
            };
          }
          return item;
        });
      } else {
        const newItem = {
          itemKey,
          foodItemId: food._id,
          name: food.name,
          price: food.price,
          unitPrice,
          image: food.image,
          foodType: food.foodType,
          preparationTime: food.preparationTime,
          selectedAddOns: selectedAddOns.map((a) => ({
            _id: a._id,
            name: a.name,
            price: a.price,
          })),
          quantity,
          itemTotal: unitPrice * quantity,
        };
        return [...prevItems, newItem];
      }
    });

    if (alreadyExists) {
      toast.success(`Updated ${food.name} quantity in cart!`);
    } else {
      toast.success(`Added ${food.name} to cart!`);
    }
  };

  const updateQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemKey);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.itemKey === itemKey) {
          return {
            ...item,
            quantity: newQuantity,
            itemTotal: item.unitPrice * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemKey) => {
    setCartItems((prev) => prev.filter((item) => item.itemKey !== itemKey));
    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem("baroda_cart");
    localStorage.removeItem("baroda_coupon");
  };

  const [serverQuote, setServerQuote] = useState(null);

  // Sync real-time pricing quote from backend server
  useEffect(() => {
    if (cartItems.length === 0) {
      setServerQuote(null);
      return;
    }

    const fetchQuote = async () => {
      try {
        const { data } = await axiosInstance.post("/cart/quote", {
          items: cartItems.map((item) => ({
            foodItemId: item.foodItemId || item._id,
            quantity: item.quantity,
            selectedAddOns: item.selectedAddOns,
          })),
          couponCode: coupon?.code || null,
        });
        if (data.success && data.quote) {
          setServerQuote(data.quote);
        }
      } catch {
        // Fallback gracefully
      }
    };

    fetchQuote();
  }, [cartItems, coupon]);

  // Calculations (Server-authoritative with client preview fallback)
  const clientSubtotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);

  let clientDiscount = 0;
  if (coupon) {
    if (coupon.discountType === "percentage") {
      clientDiscount = Math.round((clientSubtotal * (coupon.discountValue || 0)) / 100);
    } else {
      clientDiscount = coupon.discountValue || 0;
    }
    clientDiscount = Math.min(clientDiscount, clientSubtotal);
  }

  const clientTaxable = Math.max(0, clientSubtotal - clientDiscount);
  const clientTax = Math.round((clientTaxable * (settings.taxPercentage ?? 5)) / 100);
  const clientDelivery = cartItems.length > 0 ? (settings.deliveryCharge ?? 40) : 0;
  const clientTotal = cartItems.length > 0 ? clientTaxable + clientTax + clientDelivery : 0;

  const subtotal = serverQuote?.subtotal ?? clientSubtotal;
  const discount = serverQuote?.discount ?? clientDiscount;
  const tax = serverQuote?.tax ?? clientTax;
  const deliveryCharge = serverQuote?.deliveryCharge ?? clientDelivery;
  const totalAmount = serverQuote?.totalAmount ?? clientTotal;
  const freeDelivery = serverQuote?.freeDelivery || false;
  const warnings = serverQuote?.warnings || [];

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    try {
      const { data } = await axiosInstance.post("/coupons/validate", {
        code: code.trim(),
        cartTotal: subtotal,
      });
      if (data.success) {
        setCoupon(data.coupon);
        toast.success(data.message || "Coupon applied!");
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon");
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    toast.success("Coupon removed");
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryCharge,
    tax,
    discount,
    totalAmount,
    itemCount,
    coupon,
    applyCoupon,
    removeCoupon,
    settings,
    warnings,
    freeDelivery,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
