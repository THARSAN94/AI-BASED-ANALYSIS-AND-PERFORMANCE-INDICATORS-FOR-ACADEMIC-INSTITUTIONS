import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorMode = 'light' | 'dark';

export type FontStyleId =
  | 'modern-executive'
  | 'archival-academic'
  | 'technical-blueprint'
  | 'geometric-humanist'
  | 'editorial-gazette';

export interface FontOption {
  id: FontStyleId;
  name: string;
  category: string;
  headingFont: string;
  bodyFont: string;
  sampleHeading: string;
  sampleBody: string;
  description: string;
  glyph: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  {
    id: 'modern-executive',
    name: 'Modern Executive',
    category: 'Clean Grotesk',
    headingFont: 'Space Grotesk',
    bodyFont: 'Plus Jakarta Sans',
    sampleHeading: 'AICTE Approval Assessment',
    sampleBody: 'Enterprise-grade statutory pre-assessment & regulatory compliance intelligence.',
    description: 'Precision high-contrast grotesk typography crafted for executive dashboards and institutional audits.',
    glyph: 'Ag',
  },
  {
    id: 'archival-academic',
    name: 'Archival Academic',
    category: 'Collegiate Heritage Serif',
    headingFont: 'Cormorant Garamond',
    bodyFont: 'Lora',
    sampleHeading: 'Statutory Council Gazette',
    sampleBody: 'Formal collegiate serif invoking university charters, academic senate decrees, and heritage norms.',
    description: 'Prestigious classical serif typography echoing Oxford and Cambridge gazettes and formal council decrees.',
    glyph: '§A',
  },
  {
    id: 'technical-blueprint',
    name: 'Technical Blueprint',
    category: 'Engineering Monospace',
    headingFont: 'JetBrains Mono',
    bodyFont: 'JetBrains Mono',
    sampleHeading: 'FSR <= 1:20 [CRITERIA MET]',
    sampleBody: 'Engineering calculation telemetry, audit telemetry metrics, and strict statutory ratio specifications.',
    description: 'High-precision terminal monospace engineered for technical audits, formula proofs, and data sheets.',
    glyph: '{ }',
  },
  {
    id: 'geometric-humanist',
    name: 'Geometric Humanist',
    category: 'Architectural Clean Sans',
    headingFont: 'Outfit',
    bodyFont: 'Plus Jakarta Sans',
    sampleHeading: 'Institutional Readiness & Scrutiny',
    sampleBody: 'Balanced geometric proportions with generous letter spacing for modern academic administration.',
    description: 'Contemporary architectural sans-serif offering maximum legibility across dense compliance tables.',
    glyph: 'Oo',
  },
  {
    id: 'editorial-gazette',
    name: 'Editorial Gazette',
    category: 'Official Gazette Serif',
    headingFont: 'Playfair Display',
    bodyFont: 'Lora',
    sampleHeading: 'University Grants Commission',
    sampleBody: 'Statutory pre-assessment against Section 2(f) and Section 12(B) institutional recognition standards.',
    description: 'Editorial display serif inspired by national statutory publications, official gazettes, and legal decrees.',
    glyph: '¶G',
  },
];

export type DesignStyle = 'modern' | 'dark-cockpit' | 'archival';

export interface StyleOption {
  id: DesignStyle;
  name: string;
  shortLabel: string;
  tagline: string;
  palettePreview: string[];
  vibe: string;
}

export const AVAILABLE_STYLES: StyleOption[] = [
  {
    id: 'modern',
    name: 'Modern Precision Executive',
    shortLabel: 'Modern Executive',
    tagline: 'Precision Indigo & Cool Titanium · Clean Enterprise SaaS',
    palettePreview: ['#4f46e5', '#0f172a', '#f8fafc', '#10b981'],
    vibe: 'Space Grotesk typography, crisp slate borders, high-contrast clarity',
  },
  {
    id: 'dark-cockpit',
    name: 'Obsidian Cyber Command',
    shortLabel: 'Obsidian Dark',
    tagline: 'Deep Midnight Onyx & Radiant Cyan · Cyber Intelligence',
    palettePreview: ['#06b6d4', '#070b14', '#1e293b', '#10b981'],
    vibe: 'Dark mode control room, neon data indicators, high-tech telemetry',
  },
  {
    id: 'archival',
    name: 'Archival Academic & Ivy',
    shortLabel: 'Archival Academic',
    tagline: 'Imperial Navy & Warm Parchment · Traditional Council Gazette',
    palettePreview: ['#0c1f38', '#d97706', '#fafaf7', '#15803d'],
    vibe: 'Cormorant Garamond serif, burnished gold accents, collegiate heritage',
  },
];

interface ThemeContextType {
  // Mode (Light / Dark)
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
  isDark: boolean;

  // Typography (5 Font Styles)
  fontStyle: FontStyleId;
  setFontStyle: (font: FontStyleId) => void;
  availableFonts: FontOption[];
  currentFontMeta: FontOption;

  // Legacy/Compatibility support
  style: DesignStyle;
  setStyle: (style: DesignStyle) => void;
  availableStyles: StyleOption[];
  currentStyleMeta: StyleOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Color mode: 'light' or 'dark'
  const [mode, setModeState] = useState<ColorMode>(() => {
    const savedMode = localStorage.getItem('app_color_mode');
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }
    // Check legacy style preference
    const savedStyle = localStorage.getItem('app_design_style');
    if (savedStyle === 'dark-cockpit') {
      return 'dark';
    }
    // Default to clean Light mode
    return 'light';
  });

  // Font style (5 options)
  const [fontStyle, setFontStyleState] = useState<FontStyleId>(() => {
    const savedFont = localStorage.getItem('app_font_style');
    if (
      savedFont === 'modern-executive' ||
      savedFont === 'archival-academic' ||
      savedFont === 'technical-blueprint' ||
      savedFont === 'geometric-humanist' ||
      savedFont === 'editorial-gazette'
    ) {
      return savedFont as FontStyleId;
    }
    // Check legacy style preference
    const savedStyle = localStorage.getItem('app_design_style');
    if (savedStyle === 'archival') {
      return 'archival-academic';
    }
    return 'modern-executive';
  });

  // Legacy style state for compatibility
  const [style, setStyleState] = useState<DesignStyle>(() => {
    if (mode === 'dark') return 'dark-cockpit';
    if (fontStyle === 'archival-academic') return 'archival';
    return 'modern';
  });

  const setMode = (newMode: ColorMode) => {
    setModeState(newMode);
    localStorage.setItem('app_color_mode', newMode);
    if (newMode === 'dark') {
      setStyleState('dark-cockpit');
    } else {
      setStyleState(fontStyle === 'archival-academic' ? 'archival' : 'modern');
    }
  };

  const toggleMode = () => {
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
  };

  const setFontStyle = (newFont: FontStyleId) => {
    setFontStyleState(newFont);
    localStorage.setItem('app_font_style', newFont);
  };

  // Backwards compatibility for setStyle
  const setStyle = (newStyle: DesignStyle) => {
    setStyleState(newStyle);
    localStorage.setItem('app_design_style', newStyle);
    if (newStyle === 'dark-cockpit') {
      setModeState('dark');
      localStorage.setItem('app_color_mode', 'dark');
    } else {
      setModeState('light');
      localStorage.setItem('app_color_mode', 'light');
      if (newStyle === 'archival') {
        setFontStyleState('archival-academic');
        localStorage.setItem('app_font_style', 'archival-academic');
      } else {
        setFontStyleState('modern-executive');
        localStorage.setItem('app_font_style', 'modern-executive');
      }
    }
  };

  // Apply attributes to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-font', fontStyle);
    root.setAttribute('data-theme', mode === 'dark' ? 'dark-cockpit' : style);

    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode, fontStyle, style]);

  const currentFontMeta =
    AVAILABLE_FONTS.find(f => f.id === fontStyle) || AVAILABLE_FONTS[0];

  const currentStyleMeta =
    AVAILABLE_STYLES.find(s => s.id === style) || AVAILABLE_STYLES[0];

  const isDark = mode === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isDark,
        fontStyle,
        setFontStyle,
        availableFonts: AVAILABLE_FONTS,
        currentFontMeta,
        style,
        setStyle,
        availableStyles: AVAILABLE_STYLES,
        currentStyleMeta,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
