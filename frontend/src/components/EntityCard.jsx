import React from 'react';
import { Tag, CheckCircle, Table as TableIcon } from 'lucide-react';

const EntityCard = ({ icon: Icon, title, items = [], color = 'indigo' }) => {
  const colorStyles = {
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
  };

  return (
    <div className="p-4 rounded-xl glass-card border border-slate-200/60 dark:border-slate-700/60 space-y-3">
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded-lg ${colorStyles[color] || colorStyles.indigo}`}>
          {Icon ? <Icon className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
        </div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{title}</h4>
      </div>

      {items && items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-slate-400 dark:text-slate-500">No entities detected in document.</p>
      )}
    </div>
  );
};

export default EntityCard;
