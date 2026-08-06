import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-3xl gradient-bg mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/30">
          <FileQuestion className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-slate-900 dark:text-white">404</h1>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Page Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The document, report, or page route you are trying to access does not exist or has been relocated.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-white gradient-bg shadow-lg hover:opacity-95 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
