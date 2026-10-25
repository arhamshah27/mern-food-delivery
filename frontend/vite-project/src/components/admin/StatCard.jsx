import React from "react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "gold",
  description,
}) => {
  const colorMap = {
    gold: {
      bg: "bg-[#C6A15B]/10",
      border: "border-[#C6A15B]/30",
      text: "text-[#E6D3A3]",
      gradient: "from-[#C6A15B] to-[#9F7E3C]",
    },
    orange: {
      bg: "bg-[#C6A15B]/10",
      border: "border-[#C6A15B]/30",
      text: "text-[#E6D3A3]",
      gradient: "from-[#C6A15B] to-[#9F7E3C]",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
      text: "text-emerald-400",
      gradient: "from-emerald-500 to-teal-600",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/25",
      text: "text-blue-400",
      gradient: "from-blue-500 to-indigo-600",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/25",
      text: "text-purple-400",
      gradient: "from-purple-500 to-violet-600",
    },
  };

  const scheme = colorMap[color] || colorMap.gold;

  return (
    <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden group hover:border-[#C6A15B]/50 transition-all duration-300">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6A15B]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A5A5AD]">
          {title}
        </span>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${scheme.bg} border ${scheme.border} ${scheme.text} shadow-sm group-hover:scale-105 transition-transform`}
        >
          {Icon && <Icon className="w-5 h-5 text-[#C6A15B]" />}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">
          {value}
        </h3>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
            {trend}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2 text-xs text-[#868896] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default StatCard;
