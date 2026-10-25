import React from "react";
import { Search, RotateCcw, X } from "lucide-react";

const FoodFilters = ({
  search,
  setSearch,
  categories,
  selectedCategory,
  setSelectedCategory,
  foodType,
  setFoodType,
  onReset,
  totalResults = 0,
}) => {
  const hasActiveFilters = search || selectedCategory !== "all" || foodType !== "all";

  return (
    <div className="max-w-4xl mx-auto w-full space-y-5 mb-10">
      {/* 1. Centered Search Bar */}
      <div className="relative max-w-2xl mx-auto w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C6A15B] group-focus-within:text-[#E6D3A3] transition-colors pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search handcrafted curries, charcoal tikkas, dum biryanis, desserts..."
          className="w-full bg-white dark:bg-[#14151A] hover:bg-slate-50 dark:hover:bg-[#1A1B23] text-slate-900 dark:text-[#F5F0E6] placeholder-[#868896] text-sm sm:text-base pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-[#C6A15B]/25 focus:border-[#C6A15B] focus:ring-4 focus:ring-[#C6A15B]/15 outline-none transition-all shadow-sm dark:shadow-xl backdrop-blur-md"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#A5A5AD] hover:text-white hover:bg-[#232530] transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Centered Dietary Segmentation Pills */}
      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        <button
          onClick={() => setFoodType("all")}
          className={`px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border ${
            foodType === "all"
              ? "bg-gradient-to-r from-[#C6A15B] via-[#E6D3A3] to-[#9F7E3C] text-[#08090D] border-transparent shadow-lg shadow-[#C6A15B]/20 scale-105"
              : "bg-white dark:bg-[#14151A] text-slate-700 dark:text-[#A5A5AD] border-slate-200 dark:border-[#232530] hover:text-slate-900 dark:hover:text-[#F5F0E6] hover:border-[#C6A15B]/40 shadow-sm"
          }`}
        >
          All Specialties
        </button>

        <button
          onClick={() => setFoodType("veg")}
          className={`px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 border ${
            foodType === "veg"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500 shadow-md shadow-emerald-500/10 scale-105"
              : "bg-white dark:bg-[#14151A] text-slate-700 dark:text-[#A5A5AD] border-slate-200 dark:border-[#232530] hover:text-emerald-600 dark:hover:text-emerald-500 hover:border-emerald-500/40 shadow-sm"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/40" />
          Pure Vegetarian
        </button>

        <button
          onClick={() => setFoodType("non-veg")}
          className={`px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 border ${
            foodType === "non-veg"
              ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500 shadow-md shadow-rose-500/10 scale-105"
              : "bg-white dark:bg-[#14151A] text-slate-700 dark:text-[#A5A5AD] border-slate-200 dark:border-[#232530] hover:text-rose-600 dark:hover:text-rose-500 hover:border-rose-500/40 shadow-sm"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/40" />
          Non-Vegetarian
        </button>
      </div>

      {/* 3. Centered Category Chips */}
      {categories && categories.length > 0 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none flex-wrap">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`font-serif px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-200 border ${
              selectedCategory === "all"
                ? "bg-[#C6A15B]/20 text-[#8E6E30] dark:text-[#E6D3A3] border-[#C6A15B] font-bold shadow-sm"
                : "bg-white dark:bg-[#14151A] text-slate-700 dark:text-[#A5A5AD] border-slate-200 dark:border-[#232530] hover:text-[#C6A15B] dark:hover:text-[#F5F0E6] hover:border-[#C6A15B]/40 shadow-sm"
            }`}
          >
            All Courses
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`font-serif px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-200 border ${
                selectedCategory === cat._id
                  ? "bg-[#C6A15B]/20 text-[#8E6E30] dark:text-[#E6D3A3] border-[#C6A15B] font-bold shadow-sm"
                  : "bg-white dark:bg-[#14151A] text-slate-700 dark:text-[#A5A5AD] border-slate-200 dark:border-[#232530] hover:text-[#C6A15B] dark:hover:text-[#F5F0E6] hover:border-[#C6A15B]/40 shadow-sm"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* 4. Centered Result Counter & Reset Action */}
      <div className="flex items-center justify-center gap-3 text-xs text-slate-600 dark:text-[#A5A5AD] pt-1">
        <span>
          Presenting <strong className="text-slate-900 dark:text-[#F5F0E6] font-bold">{totalResults}</strong> handcrafted {totalResults === 1 ? "delicacy" : "delicacies"}
        </span>

        {hasActiveFilters && (
          <>
            <span className="text-slate-300 dark:text-[#323544]">•</span>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-[#8E6E30] dark:text-[#C6A15B] hover:underline font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FoodFilters;
