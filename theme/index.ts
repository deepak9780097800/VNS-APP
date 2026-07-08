import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ColorTokens } from './colors';
import { radii, spacing } from './spacing';
import { typography } from './typography';

export type Theme = {
  dark: boolean;
  colors: ColorTokens;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
};

export const lightTheme: Theme = {
  dark: false,
  colors: lightColors,
  typography,
  spacing,
  radii,
};

export const darkTheme: Theme = {
  dark: true,
  colors: darkColors,
  typography,
  spacing,
  radii,
};

/**
 * Resolves the active theme from the OS color scheme.
 * `app.json` sets `userInterfaceStyle: "automatic"`, so this follows the device.
 */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}

export { lightColors, darkColors, spacing, radii, typography };
export type { ColorTokens };
