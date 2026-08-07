import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  UploadCloud,
  FileSpreadsheet,
  MessageSquareCode,
  Search,
  Settings,
  ShieldAlert,
  User,
  Activity,
  Video,
  Clapperboard,
  Trophy,
  PiggyBank
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const navItems = [
    { label: t.navDashboard, path: '/dashboard', icon: LayoutDashboard },
    { label: t.navUpload, path: '/upload', icon: UploadCloud },
    { label: '💰 Finance & Target Wealth', path: '/finance', icon: PiggyBank },
    { label: '🏆 Sports AI Coach & Tactics', path: '/sports', icon: Trophy },
    { label: '🎭 Dance/Skit Video Compare', path: '/performance', icon: Clapperboard },
    { label: '🎥 Video Call & Expressions', path: '/videocall', icon: Video },
    { label: t.navHistory, path: '/history', icon: FileSpreadsheet },
    { label: t.navChat, path: '/chat', icon: MessageSquareCode },
    { label: t.navSearch, path: '/search', icon: Search },
    { label: t.navProfile, path: '/profile', icon: User },
    { label: t.navSettings, path: '/settings', icon: Settings },
  ];

  if (user.role === 'admin') {
    navItems.push({ label: t.navAdmin, path: '/admin', icon: ShieldAlert });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] glass-panel border-r border-slate-200/80 dark:border-slate-800/80 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-1 overflow-y-auto h-full flex flex-col justify-between">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Main Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Quick Stats Widget in Sidebar */}
          <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 mt-6">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>AI Engine Active</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gemini 1.5 Flash & Tesseract OCR engine active.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
