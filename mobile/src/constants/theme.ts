/**
 * AMS Design System — Redesigned with warm cream-to-green gradient palette
 * Primary: Amber #F5C26B, Background: cream #EEF3E2 → pale #F8F3E1
 * Accents: Salmon #F0926B, Blue #6C93F0, Purple #A020F0, Green #A8E0A0
 */

export const Colors = {
  // Primary — Amber
  primary: '#F5C26B',
  primaryDark: '#E0A030',
  primaryLight: '#FAD98D',
  primaryMuted: '#FEF4DC',
  primaryBg: '#FEF9ED',

  // Accents
  salmon: '#F0926B',
  salmonBg: '#FEF0EB',
  blue: '#6C93F0',
  blueBg: '#EDF1FE',
  purple: '#A020F0',
  purpleBg: '#F5E6FE',
  green: '#A8E0A0',
  greenBg: '#EDF8EC',

  // Background — soft cream gradient feel
  background: '#F2F5E8',      // soft cream-green
  backgroundAlt: '#F8F3E1',   // pale warm
  gradientStart: '#EEF3E2',
  gradientEnd: '#F8F3E1',

  // Surface — cards
  surface: '#FFFFFF',
  surfaceElevated: '#FAFDF6',
  border: '#E4EBDA',
  borderLight: '#EDF2E6',

  // Text
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textTertiary: '#A0A8A0',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#3DAA6E',
  successBg: '#E8F6EF',
  warning: '#D4841A',
  warningBg: '#FEF5E3',
  error: '#D44040',
  errorBg: '#FDEEEE',
  info: '#6C93F0',
  infoBg: '#EDF1FE',

  // Misc
  overlay: 'rgba(26, 26, 26, 0.4)',
  skeleton: '#E4EBDA',
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
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 32,
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
  '4xl': 34,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Font families — using Urbanist from expo-google-fonts
export const Fonts = {
  regular: 'sans-serif',
  medium: 'sans-serif',
  semibold: 'sans-serif',
  bold: 'sans-serif',
  extrabold: 'sans-serif',
};
