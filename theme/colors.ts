/**
 * VNS App color tokens.
 *
 * Purple + gold palette derived from the VIP Number Shop logo.
 * The token names are what the app references, so a swap here propagates
 * everywhere.
 */

export interface ColorTokens {
  primary: string;
  primaryDark: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  danger: string;
}

export const lightColors: ColorTokens = {
  primary: '#4A2C6F', // royal purple (brand)
  primaryDark: '#33204D',
  accent: '#F4C430', // gold — VIP tags & price highlight
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  success: '#16A34A',
  danger: '#DC2626',
};

/**
 * Dark variant derived from the same brand hues so `userInterfaceStyle:
 * automatic` looks intentional. Tune later alongside the brand swap.
 */
export const darkColors: ColorTokens = {
  primary: '#8B6AD1',
  primaryDark: '#4A2C6F',
  accent: '#FBD24E',
  background: '#0B1120',
  surface: '#0F172A',
  border: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  success: '#22C55E',
  danger: '#F87171',
};
