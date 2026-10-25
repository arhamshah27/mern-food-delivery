import React from "react";
import { UtensilsCrossed } from "lucide-react";

const Loader = ({ text = "Preparing fresh flavors...", fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing animated ring */}
        <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
        {/* Inner pulsing icon */}
        <div className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 shadow-inner">
          <UtensilsCrossed className="w-5 h-5 text-orange-400 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-400 tracking-wide">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center w-full">{content}</div>;
};

export default Loader;
