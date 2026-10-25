import React from "react";
import Button from "./Button";
import { Utensils } from "lucide-react";

const EmptyState = ({
  icon: Icon = Utensils,
  title = "No items found",
  description = "Try adjusting your search or filters to find what you are looking for.",
  actionText,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 my-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 shadow-lg shadow-orange-500/5">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
