import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  className = "",
  helperText,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-[#D8D4CA] mb-1.5"
        >
          {label} {required && <span className="text-[#C6A15B]">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-[#C6A15B]">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={id || name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full bg-white dark:bg-[#14151A] text-slate-900 dark:text-[#F5F0E6] placeholder-slate-400 dark:placeholder-[#868896] text-sm rounded-xl border transition-all duration-200 outline-none
            ${Icon ? "pl-10" : "pl-3.5"}
            ${isPassword ? "pr-10" : "pr-3.5"}
            py-2.5
            ${
              error
                ? "border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-slate-300 dark:border-[#232530] hover:border-[#C6A15B]/50 focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20"
            }
            ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-950" : ""}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-400 dark:text-[#A5A5AD] hover:text-[#C6A15B] dark:hover:text-[#E6D3A3] focus:outline-none transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-[#868896]">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
