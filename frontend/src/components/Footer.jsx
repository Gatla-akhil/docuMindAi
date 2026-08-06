import React from 'react';
import { FileText, Github, Shield, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              DocuMind AI Platform
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              v1.0.0 Enterprise Edition
            </span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-500 dark:text-slate-400">
            <a href="#features" className="hover:text-indigo-500 transition-colors">Features</a>
            <a href="#security" className="hover:text-indigo-500 transition-colors flex items-center gap-1">
              <Shield className="w-3 h-3" /> Security
            </a>
            <a href="#api" className="hover:text-indigo-500 transition-colors">API Reference</a>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Enterprise Intelligence
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
