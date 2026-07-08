/**
 * Spacing scale (4/8/12/16/20/24/32) and border radii.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export type Spacing = typeof spacing;
export type Radii = typeof radii;
