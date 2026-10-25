import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ className = "", showLabel = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-300 select-none ${
        isDark
          ? "bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800 hover:border-slate-700 shadow-md"
          : "bg-slate-100 border border-slate-300 text-orange-600 hover:text-orange-700 hover:bg-slate-200 shadow-sm"
      } ${className}`}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 scale-100 text-slate-700" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-bold tracking-tight">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
