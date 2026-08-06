import React from 'react';

export const CardSkeleton = () => (
  <div className="p-6 rounded-2xl glass-card animate-pulse space-y-4">
    <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-1/3"></div>
    <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
    <div className="h-3 bg-slate-200 dark:bg-slate-700/40 rounded w-2/3"></div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse border-b border-slate-200/50 dark:border-slate-800/50">
    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-48"></div></td>
    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-24"></div></td>
    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-20"></div></td>
    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-32"></div></td>
    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-16"></div></td>
  </tr>
);

export const DetailSkeleton = () => (
  <div className="space-y-6 animate-pulse p-6">
    <div className="h-8 bg-slate-200 dark:bg-slate-700/80 rounded w-2/3"></div>
    <div className="h-24 bg-slate-200 dark:bg-slate-700/50 rounded-xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-32 bg-slate-200 dark:bg-slate-700/40 rounded-xl"></div>
      <div className="h-32 bg-slate-200 dark:bg-slate-700/40 rounded-xl"></div>
      <div className="h-32 bg-slate-200 dark:bg-slate-700/40 rounded-xl"></div>
    </div>
  </div>
);

export default { CardSkeleton, TableRowSkeleton, DetailSkeleton };
