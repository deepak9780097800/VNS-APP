import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export interface CardProps extends ViewProps {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, padded = true, style, ...rest }: CardProps) {
  const theme = useTheme();
  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radii.md,
    padding: padded ? theme.spacing.base : 0,
  };
  return (
    <View style={[cardStyle, style]} {...rest}>
      {children}
    </View>
  );
}
