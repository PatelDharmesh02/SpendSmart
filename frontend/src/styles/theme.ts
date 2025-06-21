// src/styles/theme.ts
export interface ThemeColors {
  // Core UI
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  cardBg: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverted: string;
  
  // Borders & Dividers
  border: string;
  borderLight: string;
  divider: string;
  
  // Status
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  
  // Charts (15-color palette for data visualization)
  chart: string[];
  
  // Gradients
  gradientPrimary: string;
  gradientSecondary: string;
}

interface ThemeMetrics {
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    section: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    pill: string;
    circular: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
    inset: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    laptop: string;
    desktop: string;
    widescreen: string;
  };
}

export interface AppTheme extends ThemeColors, ThemeMetrics {}

// Base metrics that don't change with theme
export const metrics: ThemeMetrics = {
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2.5rem',    // 40px
    xxl: '4rem',     // 64px
    section: '6rem', // 96px
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    pill: '9999px',
    circular: '50%',
  },
  shadow: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    inset: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
  },
  breakpoints: {
    mobile: '0px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1280px',
    widescreen: '1536px',
  },
};

// Chart color palettes (optimized for accessibility and differentiation)
const lightChartColors = [
  '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#7209b7',
  '#2ec4b6', '#ff9f1c', '#e71d36', '#2a9d8f', '#e9c46a',
  '#264653', '#f4a261', '#e76f51', '#9b5de5', '#00bbf9'
];

const darkChartColors = [
  '#4895ef', '#560bad', '#4cc9f0', '#ff70a6', '#b5179e',
  '#06d6a0', '#ffd166', '#ef476f', '#118ab2', '#ffd166',
  '#2a9d8f', '#f4a261', '#e76f51', '#c77dff', '#90e0ef'
];

export const theme: Record<'light' | 'dark', AppTheme> = {
  light: {
    // Core colors
    primary: '#4361ee',
    primaryLight: '#e0e7ff',
    primaryDark: '#3730a3',
    secondary: '#3a0ca3',
    secondaryLight: '#ede9fe',
    secondaryDark: '#312e81',
    accent: '#4cc9f0',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceElevated: '#f1f5f9',
    cardBg: '#ffffff',
    
    // Text
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    textInverted: '#ffffff',
    
    // Borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    divider: '#e2e8f0',
    
    // Status
    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    danger: '#ef4444',
    dangerLight: '#fee2e2',
    info: '#0ea5e9',
    infoLight: '#e0f2fe',
    
    // Charts
    chart: lightChartColors,
    
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
    gradientSecondary: 'linear-gradient(135deg, #4cc9f0 0%, #3a0ca3 100%)',
    
    // Metrics
    ...metrics
  },
  dark: {
    // Core colors
    primary: '#818cf8',
    primaryLight: '#4f46e5',
    primaryDark: '#3730a3',
    secondary: '#a78bfa',
    secondaryLight: '#7c3aed',
    secondaryDark: '#5b21b6',
    accent: '#22d3ee',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceElevated: '#334155',
    cardBg: '#1e293b',
    
    // Text
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textInverted: '#0f172a',
    
    // Borders
    border: '#334155',
    borderLight: '#1e293b',
    divider: '#334155',
    
    // Status
    success: '#10b981',
    successLight: '#065f46',
    warning: '#f59e0b',
    warningLight: '#854d0e',
    danger: '#ef4444',
    dangerLight: '#7f1d1d',
    info: '#0ea5e9',
    infoLight: '#075985',
    
    // Charts
    chart: darkChartColors,
    
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
    gradientSecondary: 'linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%)',
    
    // Metrics
    ...metrics
  }
};

// Type for styled-components theme
export type ThemeType = AppTheme;