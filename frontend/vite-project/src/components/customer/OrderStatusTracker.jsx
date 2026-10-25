import React from "react";
import { CheckCircle2, Clock, ChefHat, Bike, Home, AlertCircle } from "lucide-react";

const STAGES = [
  { key: "Placed", label: "Order Placed", icon: Clock },
  { key: "Preparing", label: "Preparing in Kitchen", icon: ChefHat },
  { key: "Out for delivery", label: "Out for Delivery", icon: Bike },
  { key: "Delivered", label: "Delivered", icon: Home },
];

const OrderStatusTracker = ({ status, cancelledReason }) => {
  const isCancelled = status === "Cancelled";

  if (isCancelled) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center my-4">
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-red-400">Order Cancelled</h4>
        <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
          {cancelledReason || "This order was cancelled. If you were charged, your refund will be processed within 2-4 business days."}
        </p>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-6 my-6 shadow-md dark:shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-[#C6A15B]/15">
        <div>
          <h4 className="text-sm font-serif font-bold text-slate-900 dark:text-[#F5F0E6] tracking-wide">Live Culinary Tracking</h4>
          <p className="text-xs text-slate-600 dark:text-[#A5A5AD]">Real-time palace kitchen and royal chauffeur dispatch</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8E6E30] dark:bg-[#C6A15B] animate-ping" />
          <span className="text-xs font-semibold text-[#8E6E30] dark:text-[#E6D3A3] uppercase tracking-wider">
            {status}
          </span>
        </div>
      </div>

      {/* Progress Line and Icons */}
      <div className="relative flex items-center justify-between">
        {/* Connecting Track Line */}
        <div className="absolute left-6 right-6 top-6 h-1 bg-slate-200 dark:bg-[#08090D] border border-slate-300 dark:border-[#C6A15B]/20 -translate-y-1/2 z-0 rounded-full" />
        <div
          className="absolute left-6 top-6 h-1 bg-gradient-to-r from-[#8E6E30] via-[#C6A15B] to-[#9F7E3C] -translate-y-1/2 z-0 transition-all duration-700 rounded-full shadow-[0_0_12px_rgba(198,161,91,0.5)]"
          style={{
            width: `${Math.max(
              0,
              (currentStageIndex / (STAGES.length - 1)) * 100
            )}%`,
          }}
        />

        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border
                  ${
                    isDone
                      ? "bg-[#C6A15B] border-[#E6D3A3] text-white dark:text-[#08090D] shadow-lg shadow-[#C6A15B]/25"
                      : isCurrent
                      ? "bg-gradient-to-tr from-[#8E6E30] via-[#C6A15B] to-[#9F7E3C] border-[#F5F0E6] text-white dark:text-[#08090D] shadow-xl shadow-[#C6A15B]/40 scale-110 animate-pulse font-bold"
                      : "bg-slate-100 dark:bg-[#08090D] border-slate-200 dark:border-[#C6A15B]/20 text-slate-500 dark:text-[#A5A5AD]"
                  }
                `}
              >
                {isDone ? (
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <span
                className={`mt-3 text-xs font-semibold text-center max-w-[80px] sm:max-w-none transition-colors ${
                  isCurrent
                    ? "text-[#8E6E30] dark:text-[#E6D3A3] font-bold"
                    : isDone
                    ? "text-[#8E6E30] dark:text-[#C6A15B]"
                    : "text-slate-500 dark:text-[#A5A5AD]"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTracker;
