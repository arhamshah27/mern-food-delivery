import React from "react";

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800/80 rounded-xl ${className}`} />
);

export const FoodCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
    <Skeleton className="w-full h-44 rounded-xl" />
    <div className="flex justify-between items-center">
      <Skeleton className="w-20 h-4" />
      <Skeleton className="w-12 h-4" />
    </div>
    <Skeleton className="w-3/4 h-5" />
    <Skeleton className="w-full h-8" />
    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800/60">
      <Skeleton className="w-16 h-6" />
      <Skeleton className="w-24 h-9 rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="border-b border-slate-200 dark:border-slate-800/60">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export default Skeleton;
