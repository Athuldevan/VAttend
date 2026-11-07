/**
 * AMS Design System — Academic & Utilitarian (Victoria College Palakkad)
 * Warm paper background, dark ink text, strong typography.
 */

export const Colors = {
  // Base
  background: "#F6F4EE",
  surface: "#FFFFFF",
  ink: "#12161C",
  muted: "#5B6470",
  line: "#DDD8CB",

  // Brand & Actions
  brand: "#1F3A5F",
  brandHover: "#162A45",

  // Semantic status
  present: "#2F7D5B",
  late: "#8A5A0E",
  absent: "#B13A35",

  // Tints & backgrounds
  tintOk: "#E4F0E9",
  tintPending: "#F6EBD2",
  tintError: "#F8E3E1",
  tintNeutral: "#E9E5D9",
  tintDisabled: "#D5D8DC",

  // Compatibility aliases
  text: "#12161C",
  textSecondary: "#5B6470",
  textTertiary: "#8D97A5",
  textInverse: "#FFFFFF",
  border: "#DDD8CB",
  primary: "#1F3A5F",
  success: "#2F7D5B",
  warning: "#8A5A0E",
  error: "#B13A35",
  card: "#FFFFFF",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
} as const;

export const Radius = {
  base: 6,
  sm: 4,
  md: 6,
  lg: 6,
  xl: 6,
  full: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 44,
} as const;

export const Fonts = {
  heading: "Newsreader_600SemiBold",
  body: "PublicSans_400Regular",
  bodySemiBold: "PublicSans_600SemiBold",

  // Aliases for body & weights
  regular: "PublicSans_400Regular",
  medium: "PublicSans_400Regular",
  semibold: "PublicSans_600SemiBold",
  bold: "PublicSans_600SemiBold",
  serif: "Newsreader_600SemiBold",
};
