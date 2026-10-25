import React from "react";

const STATUS_STYLES = {
  // Orders
  Placed: "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
  Preparing: "bg-amber-50 dark:bg-[#C6A15B]/15 text-amber-800 dark:text-[#E6D3A3] border-amber-200 dark:border-[#C6A15B]/35",
  "Out for delivery": "bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
  Delivered: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  Cancelled: "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",

  // Availability / Active status
  Active: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  Inactive: "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30",
  Available: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  "Out of Stock": "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",

  // Payment status
  Pending: "bg-amber-50 dark:bg-[#C6A15B]/15 text-amber-800 dark:text-[#E6D3A3] border-amber-200 dark:border-[#C6A15B]/35",
  Completed: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  Failed: "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",

  // Food types
  veg: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  "non-veg": "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
};

const StatusBadge = ({ status, className = "" }) => {
  const style = STATUS_STYLES[status] || "bg-slate-100 dark:bg-[#14151A] text-slate-700 dark:text-[#A5A5AD] border-slate-200 dark:border-[#232530]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};

export default StatusBadge;
