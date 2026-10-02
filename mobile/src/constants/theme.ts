/**
 * AMS Design System — Color palette inspired by the college clock tower
 * Terracotta rose (#B44B5E), warm cream (#F5EDE3), deep maroon (#7A2D3A)
 */

export const Colors = {
  // Primary — Terracotta Rose
  primary: '#B44B5E',
  primaryDark: '#7A2D3A',
  primaryLight: '#D4848F',
  primaryMuted: '#F2D6DA',
  primaryBg: '#FDF2F4',

  // Neutrals — Warm tones
  background: '#FAF7F4',
  surface: '#FFFFFF',
  surfaceElevated: '#FFF9F6',
  border: '#EDE5DD',
  borderLight: '#F3EDE7',

  // Text
  text: '#2D1F24',
  textSecondary: '#7A6B70',
  textTertiary: '#A89A9F',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#3D8B5E',
  successBg: '#EBF5EE',
  warning: '#C4842D',
  warningBg: '#FEF5E7',
  error: '#C44040',
  errorBg: '#FDEDED',
  info: '#4A7FB5',
  infoBg: '#EDF4FB',

  // Misc
  overlay: 'rgba(45, 31, 36, 0.4)',
  skeleton: '#EDE5DD',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
