/**
 * Typography scale. System font for now; a Google font (Poppins/Inter)
 * can be layered in later without changing these size tokens.
 */

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 26,
  xl: 30,
  '2xl': 36,
} as const;

export const typography = { fontSize, fontWeight, lineHeight } as const;

export type Typography = typeof typography;
