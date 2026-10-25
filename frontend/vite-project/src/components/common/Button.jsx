import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none tracking-wide";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-[#C6A15B] via-[#E6D3A3] to-[#9F7E3C] text-[#08090D] shadow-lg shadow-[#C6A15B]/20 hover:brightness-110 active:scale-[0.98]",
    secondary:
      "bg-white dark:bg-[#14151A] text-slate-800 dark:text-[#F5F0E6] border border-slate-300 dark:border-[#C6A15B]/30 hover:border-[#C6A15B] hover:bg-slate-50 dark:hover:bg-[#1A1B23] shadow-sm active:scale-[0.98]",
    outline:
      "border border-[#C6A15B]/60 text-[#8E6E30] dark:text-[#E6D3A3] hover:bg-[#C6A15B]/10 hover:border-[#C6A15B] active:scale-[0.98]",
    danger:
      "bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white active:scale-[0.98]",
    ghost:
      "text-slate-600 dark:text-[#A5A5AD] hover:text-slate-900 dark:hover:text-[#F5F0E6] hover:bg-slate-100 dark:hover:bg-[#14151A] active:scale-[0.98]",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
