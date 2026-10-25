import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Plus, Eye, Sparkles } from "lucide-react";
import { useCart } from "../../context/CartContext";

const FALLBACK_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

const FoodCard = ({ food, onOpenAddOns }) => {
  const { addToCart } = useCart();
  const [imgSrc, setImgSrc] = useState(food.image || FALLBACK_FOOD_IMAGE);

  useEffect(() => {
    setImgSrc(food.image || FALLBACK_FOOD_IMAGE);
  }, [food.image]);

  const isVeg = food.foodType === "veg";

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (food.addOns && food.addOns.length > 0 && onOpenAddOns) {
      onOpenAddOns(food);
    } else {
      addToCart(food, [], 1);
    }
  };

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_FOOD_IMAGE) {
      setImgSrc(FALLBACK_FOOD_IMAGE);
    }
  };

  return (
    <div
      className={`group relative flex flex-col h-full bg-white dark:bg-[#14151A] border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#C6A15B]/15 hover:-translate-y-1.5 ${
        food.isAvailable
          ? "border-slate-200 dark:border-[#C6A15B]/20 hover:border-[#C6A15B]/60"
          : "border-slate-200/60 dark:border-[#232530] opacity-60"
      }`}
    >
      {/* 1. Image Container with 4:3 Aspect Ratio and Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#08090D]">
        <img
          src={imgSrc}
          alt={food.name}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Veg / Non-Veg Standard Icon */}
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center bg-[#08090D]/95 backdrop-blur-md shadow-md ${
              isVeg ? "border-emerald-500" : "border-rose-500"
            }`}
            title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isVeg ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          </div>

          {/* Popular or Out of Stock Badge */}
          <div className="flex items-center gap-1.5">
            {!food.isAvailable ? (
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white backdrop-blur-sm shadow-md">
                Out of Stock
              </span>
            ) : food.isPopular ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#C6A15B] to-[#E6D3A3] text-[#08090D] backdrop-blur-md shadow-md shadow-[#C6A15B]/20">
                <Sparkles className="w-3 h-3 text-[#08090D] fill-[#08090D]" />
                Chef's Pick
              </span>
            ) : null}
          </div>
        </div>

        {/* Preparation Time Floating Badge */}
        {food.preparationTime && (
          <div
            data-preserve-dark="true"
            className="prep-badge absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#08090D]/90 backdrop-blur-md text-[11px] font-semibold border border-[#C6A15B]/35 pointer-events-none shadow-md z-10"
          >
            <Clock className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
            <span className="text-[#F5F0E6] font-medium leading-none">{food.preparationTime} mins</span>
          </div>
        )}
      </div>

      {/* 2. Content Body */}
      <div className="flex flex-col flex-1 p-5">
        {food.category?.name && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C6A15B] block mb-1">
            {food.category.name}
          </span>
        )}

        <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F0E6] group-hover:text-[#8E6E30] dark:group-hover:text-[#E6D3A3] transition-colors line-clamp-1 mb-1.5">
          <Link
            to={`/food/${food._id}`}
            className="hover:underline text-slate-900 dark:text-[#F5F0E6] group-hover:text-[#8E6E30] dark:group-hover:text-[#E6D3A3]"
          >
            {food.name}
          </Link>
        </h3>

        <p className="text-xs text-slate-600 dark:text-[#A5A5AD] line-clamp-2 leading-relaxed mb-4 min-h-[32px] font-sans">
          {food.description}
        </p>

        {/* 3. Footer / Pricing & Actions */}
        <div className="mt-auto pt-3.5 border-t border-slate-200 dark:border-[#232530] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#868896] tracking-wider block leading-none mb-1">
              Royal Price
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">
              ₹{food.price}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/food/${food._id}`}
              className="p-2.5 rounded-xl text-slate-600 dark:text-[#A5A5AD] hover:text-[#8E6E30] dark:hover:text-[#F5F0E6] bg-slate-100 dark:bg-[#1A1B23] hover:bg-slate-200 dark:hover:bg-[#232530] transition-colors border border-slate-200 dark:border-[#232530] shadow-sm"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={handleQuickAdd}
              disabled={!food.isAvailable}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-[#08090D] bg-gradient-to-r from-[#C6A15B] via-[#E6D3A3] to-[#9F7E3C] shadow-md shadow-[#C6A15B]/20 hover:brightness-110 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
