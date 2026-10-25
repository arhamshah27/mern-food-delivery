import React, { useState } from "react";

const FALLBACK_CAT_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";

const CategoryCard = ({ category, isSelected, onClick }) => {
  const [imgSrc, setImgSrc] = useState(category.image || FALLBACK_CAT_IMAGE);

  return (
    <button
      onClick={() => onClick(category._id)}
      className={`group relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 text-center w-full min-w-[130px] sm:min-w-[150px] select-none
        ${
          isSelected
            ? "bg-gradient-to-b from-[#C6A15B]/20 to-[#F3ECE1] dark:from-[#C6A15B]/20 dark:via-[#181920] dark:to-[#14151A] border-[#C6A15B] shadow-xl shadow-[#C6A15B]/20 scale-102 ring-1 ring-[#C6A15B]/40"
            : "bg-white dark:bg-[#14151A]/80 border-slate-200 dark:border-[#232530] hover:border-[#C6A15B]/60 hover:bg-[#FAF7F2] dark:hover:bg-[#1A1B23] shadow-sm hover:shadow-md"
        }
      `}
    >
      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-3 border border-[#C6A15B]/25 shadow-md group-hover:scale-105 group-hover:border-[#C6A15B]/50 transition-all duration-300 relative bg-slate-100 dark:bg-[#08090D]">
        <img
          src={imgSrc}
          alt={category.name}
          onError={() => setImgSrc(FALLBACK_CAT_IMAGE)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-[#08090D]/60 to-transparent" />
      </div>

      <span
        className={`font-serif text-xs sm:text-sm font-semibold tracking-wide transition-colors line-clamp-1 ${
          isSelected
            ? "text-[#8E6E30] dark:text-[#E6D3A3] font-bold"
            : "text-slate-800 dark:text-[#D8D4CA] group-hover:text-[#8E6E30] dark:group-hover:text-[#F5F0E6]"
        }`}
      >
        {category.name}
      </span>
    </button>
  );
};

export default CategoryCard;
