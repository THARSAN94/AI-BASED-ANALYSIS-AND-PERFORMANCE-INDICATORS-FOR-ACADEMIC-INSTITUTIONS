import React from 'react';
import {
  ShieldCheck,
  GraduationCap,
  FileCheck2,
  LogOut,
  User as UserIcon,
  BookOpenCheck,
  History,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StyleSwitcher } from './StyleSwitcher';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenCriteria: (type: 'aicte' | 'ugc') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenCriteria,
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleMode } = useTheme();

  const headerBgClass = isDark
    ? 'bg-[#070b14]/95 border-slate-800 text-slate-100'
    : 'bg-white/95 border-slate-200 text-slate-900';

  const logoBgClass = isDark
    ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-700 text-white shadow-indigo-950/40 border-indigo-400/30'
    : 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-indigo-200 border-indigo-500/20';

  const activeLinkClass = isDark
    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
    : 'bg-indigo-600 text-white font-semibold shadow-sm';

  const inactiveLinkClass = isDark
    ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';

  const primaryBtnClass = isDark
    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur border-b shadow-sm transition-colors duration-200 ${headerBgClass}`}>
      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform border ${logoBgClass}`}>
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-serif font-bold text-base sm:text-lg tracking-tight group-hover:opacity-90 transition-opacity ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Academic Compliance Engine
              </span>
              <span className={`hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold font-mono border ${
                isDark
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                AICTE & UGC
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Statutory Performance & Approval Eligibility Analysis
            </p>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {user && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'dashboard' ? activeLinkClass : inactiveLinkClass
              }`}
            >
              Dashboard
            </button>
          )}

          <button
            onClick={() => onNavigate('aicte')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'aicte' ? activeLinkClass : inactiveLinkClass
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
            AICTE Assessment
          </button>

          <button
            onClick={() => onNavigate('ugc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'ugc' ? activeLinkClass : inactiveLinkClass
            }`}
          >
            <FileCheck2 className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            UGC 2(f)/12(B)
          </button>

          <button
            onClick={() => onOpenCriteria('aicte')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${inactiveLinkClass}`}
            title="View configured statutory criteria stored in database"
          >
            <BookOpenCheck className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300' : 'text-amber-600'}`} />
            Criteria Directory
          </button>

          {user && (
            <button
              onClick={() => onNavigate('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'history' ? activeLinkClass : inactiveLinkClass
              }`}
            >
              <History className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300' : 'text-amber-600'}`} />
              History
            </button>
          )}
        </nav>

        {/* Right actions: Light/Dark Mode Quick Toggle, Font Style Switcher & Auth */}
        <div className="flex items-center gap-2">
          {/* Quick Sun/Moon Toggle Button */}
          <button
            onClick={toggleMode}
            className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-750 text-amber-400 border-slate-700 hover:border-slate-600 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-200 shadow-sm'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Interactive Appearance & 5-Font Switcher */}
          <StyleSwitcher />

          {user ? (
            <div className="flex items-center gap-2.5 ml-1">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {user.name}
                </span>
                <span className={`text-[10px] max-w-[150px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`} title={user.collegeName}>
                  {user.collegeName}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  onNavigate('landing');
                }}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/80 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200'
                    : 'border-slate-200 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600'
                }`}
                title="Log out of institutional account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={() => onOpenAuth('login')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer font-sans ${primaryBtnClass}`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Register College</span>
                <span className="sm:hidden">Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
