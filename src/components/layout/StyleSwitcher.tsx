import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Type, Check, ChevronDown, Sparkles, BookOpen } from 'lucide-react';
import { useTheme, FontStyleId, ColorMode } from '../../context/ThemeContext';

export const StyleSwitcher: React.FC = () => {
  const {
    mode,
    setMode,
    toggleMode,
    isDark,
    fontStyle,
    setFontStyle,
    availableFonts,
    currentFontMeta,
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buttonClass = isDark
    ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-100 border-slate-700 hover:border-slate-600 shadow-sm'
    : 'bg-slate-100 hover:bg-slate-200/90 text-slate-800 border-slate-200 hover:border-slate-300 shadow-sm';

  const menuCardBg = isDark
    ? 'bg-[#0f172a] border-slate-700 text-slate-100 shadow-2xl'
    : 'bg-white border-slate-200 text-slate-900 shadow-2xl';

  const sectionHeaderBg = isDark
    ? 'bg-[#080d1a] border-slate-800 text-slate-300'
    : 'bg-slate-50 border-slate-200 text-slate-700';

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer group ${buttonClass}`}
        title="Customize Theme & Typography Options"
        aria-label="Appearance & Typography settings"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5">
          <Type className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-indigo-600'} transition-transform group-hover:scale-110`} />
          <span className="hidden md:inline text-xs font-semibold">Font:</span>
          <span className={`font-bold ${isDark ? 'text-cyan-300' : 'text-indigo-600'} max-w-[110px] truncate`}>
            {currentFontMeta.name}
          </span>
        </div>

        {/* Small Mode indicator glyph */}
        <span
          className={`p-0.5 rounded text-[10px] flex items-center justify-center ${
            isDark ? 'bg-slate-700/80 text-amber-300' : 'bg-slate-200 text-amber-600'
          }`}
          title={isDark ? 'Dark Mode' : 'Light Mode'}
        >
          {isDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
        </span>

        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl border ${menuCardBg} z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150`}
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold font-serif uppercase tracking-wider text-amber-300">
                  Appearance & Typography
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/15 text-slate-200 font-mono font-medium">
                5 Font Styles
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Select your color preference and statutory typography system.
            </p>
          </div>

          {/* Color Mode Segmented Control */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Color Mode
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              <button
                onClick={() => setMode('light')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isDark
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Light Mode</span>
                {!isDark && <Check className="w-3 h-3 text-indigo-600 ml-0.5" />}
              </button>

              <button
                onClick={() => setMode('dark')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 text-cyan-300 shadow-sm border border-slate-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>Dark Mode</span>
                {isDark && <Check className="w-3 h-3 text-cyan-400 ml-0.5" />}
              </button>
            </div>
          </div>

          {/* 5 Font Styles Options */}
          <div className="p-3 space-y-2 max-h-[360px] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Font Styles (5 Options)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Heading + Body
              </span>
            </div>

            {availableFonts.map((f) => {
              const isSelected = f.id === fontStyle;

              // Derive inline font family for the item preview
              const headingFontFamily =
                f.id === 'modern-executive'
                  ? "'Space Grotesk', sans-serif"
                  : f.id === 'archival-academic'
                    ? "'Cormorant Garamond', Georgia, serif"
                    : f.id === 'technical-blueprint'
                      ? "'JetBrains Mono', monospace"
                      : f.id === 'geometric-humanist'
                        ? "'Outfit', sans-serif"
                        : "'Playfair Display', Georgia, serif";

              const bodyFontFamily =
                f.id === 'archival-academic' || f.id === 'editorial-gazette'
                  ? "'Lora', serif"
                  : f.id === 'technical-blueprint'
                    ? "'JetBrains Mono', monospace"
                    : "'Plus Jakarta Sans', sans-serif";

              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setFontStyle(f.id);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer border flex flex-col gap-1.5 ${
                    isSelected
                      ? isDark
                        ? 'bg-slate-800/90 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-indigo-50/70 border-indigo-500/80 shadow-sm ring-1 ring-indigo-500/20'
                      : isDark
                        ? 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {/* Stylized Glyph Badge rendered in that exact font */}
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border shrink-0 ${
                          isSelected
                            ? isDark
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                              : 'bg-indigo-600 text-white border-indigo-700'
                            : isDark
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        style={{ fontFamily: headingFontFamily }}
                      >
                        {f.glyph}
                      </span>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-xs font-bold"
                            style={{ fontFamily: headingFontFamily }}
                          >
                            {f.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                              isSelected
                                ? isDark
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {f.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">
                          {f.headingFont} / {f.bodyFont}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-semibold ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
                          Active
                        </span>
                        <Check className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
                      </div>
                    )}
                  </div>

                  {/* Live preview phrase */}
                  <div
                    className={`p-2 rounded-lg text-[11px] leading-snug border ${
                      isSelected
                        ? isDark
                          ? 'bg-[#091124] border-cyan-900/40 text-cyan-100'
                          : 'bg-white border-indigo-200 text-indigo-950'
                        : isDark
                          ? 'bg-slate-950/50 border-slate-800/80 text-slate-300'
                          : 'bg-slate-50 border-slate-150 text-slate-700'
                    }`}
                  >
                    <p
                      className="font-bold text-xs line-clamp-1"
                      style={{ fontFamily: headingFontFamily }}
                    >
                      {f.sampleHeading}
                    </p>
                    <p
                      className="text-[10px] mt-0.5 line-clamp-1 opacity-90"
                      style={{ fontFamily: bodyFontFamily }}
                    >
                      {f.sampleBody}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
            <span>Instant switch across all audit views</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
