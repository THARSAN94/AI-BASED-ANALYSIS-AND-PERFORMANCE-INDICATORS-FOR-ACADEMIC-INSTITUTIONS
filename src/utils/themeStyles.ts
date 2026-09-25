import { DesignStyle, ColorMode } from '../context/ThemeContext';

export interface ThemeStyles {
  pageBg: string;
  cardBg: string;
  cardMuted: string;
  textHeading: string;
  textMuted: string;
  textBody: string;
  borderSubtle: string;
  borderMedium: string;
  accentPrimary: string;
  accentText: string;
  headerBg: string;
  badgeSatisfied: string;
  badgeDeficient: string;
  inputBg: string;
  heroGradient: string;
  aicteBanner: string;
  ugcBanner: string;
  noticeBanner: string;
}

export function getThemeClasses(styleOrMode: DesignStyle | ColorMode | string): ThemeStyles {
  // If it's dark-cockpit or explicit dark mode
  const isDark = styleOrMode === 'dark-cockpit' || styleOrMode === 'dark';
  const isArchivalLight = styleOrMode === 'archival';

  if (isDark) {
    return {
      pageBg: 'bg-[#090d16] text-[#f8fafc]',
      cardBg: 'bg-[#0f172a] border border-slate-800 text-[#f8fafc] shadow-lg',
      cardMuted: 'bg-[#131b2e] border border-slate-800/80 text-slate-300',
      textHeading: 'text-white',
      textMuted: 'text-slate-400',
      textBody: 'text-slate-200',
      borderSubtle: 'border-slate-800',
      borderMedium: 'border-slate-700',
      accentPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-indigo-900/30 shadow-md',
      accentText: 'text-indigo-400',
      headerBg: 'bg-[#070b14]/95 backdrop-blur border-b border-slate-800 text-white shadow-lg',
      badgeSatisfied: 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60',
      badgeDeficient: 'bg-rose-950/80 text-rose-300 border border-rose-700/60',
      inputBg: 'bg-[#091124] border border-slate-700 text-white placeholder-slate-500 focus:border-indigo-400 focus:bg-[#0d1833]',
      heroGradient: 'bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#090d16] border-b border-slate-800',
      aicteBanner: 'bg-gradient-to-r from-[#030712] via-[#1e1b4b] to-[#030712] border border-indigo-500/40 text-white',
      ugcBanner: 'bg-gradient-to-r from-[#030712] via-[#062c24] to-[#030712] border border-emerald-500/40 text-white',
      noticeBanner: 'bg-slate-900/90 border border-indigo-900/60 text-slate-300',
    };
  }

  if (isArchivalLight) {
    return {
      pageBg: 'bg-[#fafaf7] text-stone-900',
      cardBg: 'bg-white border border-stone-200 text-stone-900 shadow-sm',
      cardMuted: 'bg-[#f5f2ea] border border-stone-200 text-stone-700',
      textHeading: 'text-[#0c1f38]',
      textMuted: 'text-stone-500',
      textBody: 'text-stone-700',
      borderSubtle: 'border-stone-200',
      borderMedium: 'border-stone-300',
      accentPrimary: 'bg-[#0c1f38] hover:bg-[#162e52] text-amber-100 font-semibold border border-amber-500/30 shadow-sm',
      accentText: 'text-amber-800',
      headerBg: 'bg-white/95 backdrop-blur border-b border-stone-200 text-stone-900 shadow-sm',
      badgeSatisfied: 'bg-emerald-50 text-emerald-800 border border-emerald-300',
      badgeDeficient: 'bg-rose-50 text-rose-800 border border-rose-300',
      inputBg: 'bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:border-[#0c1f38] focus:bg-white',
      heroGradient: 'bg-gradient-to-b from-[#f5f2ea] via-[#fafaf7] to-[#ffffff] border-b border-stone-200/80',
      aicteBanner: 'bg-gradient-to-r from-[#0c1f38] via-[#142d4c] to-[#0c1f38] border border-amber-500/30 text-stone-100',
      ugcBanner: 'bg-gradient-to-r from-[#0c1f38] via-[#0f2d2f] to-[#0c1f38] border border-emerald-500/30 text-stone-100',
      noticeBanner: 'bg-amber-50/90 border border-amber-300/80 text-stone-700',
    };
  }

  // Modern Light (Default)
  return {
    pageBg: 'bg-[#f8fafc] text-slate-900',
    cardBg: 'bg-white border border-slate-200 text-slate-900 shadow-sm',
    cardMuted: 'bg-slate-50 border border-slate-200 text-slate-700',
    textHeading: 'text-slate-900',
    textMuted: 'text-slate-500',
    textBody: 'text-slate-700',
    borderSubtle: 'border-slate-200',
    borderMedium: 'border-slate-300',
    accentPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-indigo-600/20 shadow-md',
    accentText: 'text-indigo-600',
    headerBg: 'bg-white/95 backdrop-blur border-b border-slate-200 text-slate-900 shadow-sm',
    badgeSatisfied: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    badgeDeficient: 'bg-rose-50 text-rose-800 border border-rose-200',
    inputBg: 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white',
    heroGradient: 'bg-gradient-to-b from-indigo-50/60 via-slate-50 to-[#ffffff] border-b border-slate-200',
    aicteBanner: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white',
    ugcBanner: 'bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 text-white',
    noticeBanner: 'bg-indigo-50/80 border border-indigo-200 text-slate-800',
  };
}
