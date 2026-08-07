import React from 'react';
import { useLanguage, translations } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ variant = 'default' }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:border-indigo-500 transition-colors">
        <Globe className="w-3.5 h-3.5 text-indigo-500" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="bg-transparent text-slate-800 dark:text-slate-100 font-medium focus:outline-none cursor-pointer pr-1"
        >
          {Object.keys(translations).map((code) => (
            <option key={code} value={code} className="bg-slate-900 text-white">
              {translations[code].flag} {translations[code].name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageSelector;
