import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';
type Tone = 'primary' | 'secondary' | 'accent' | 'inverse' | 'danger' | 'success';

export interface ThemedTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  weight?: keyof ReturnType<typeof useTheme>['typography']['fontWeight'];
}

export function ThemedText({
  variant = 'body',
  tone = 'primary',
  weight,
  style,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const { fontSize, fontWeight, lineHeight } = theme.typography;

  const variantStyle: Record<Variant, TextStyle> = {
    display: { fontSize: fontSize['2xl'], lineHeight: lineHeight['2xl'], fontWeight: fontWeight.bold },
    title: { fontSize: fontSize.xl, lineHeight: lineHeight.xl, fontWeight: fontWeight.bold },
    heading: { fontSize: fontSize.lg, lineHeight: lineHeight.lg, fontWeight: fontWeight.semibold },
    body: { fontSize: fontSize.base, lineHeight: lineHeight.base, fontWeight: fontWeight.regular },
    label: { fontSize: fontSize.sm, lineHeight: lineHeight.sm, fontWeight: fontWeight.medium },
    caption: { fontSize: fontSize.xs, lineHeight: lineHeight.xs, fontWeight: fontWeight.regular },
  };

  const toneColor: Record<Tone, string> = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    accent: theme.colors.accent,
    inverse: '#FFFFFF',
    danger: theme.colors.danger,
    success: theme.colors.success,
  };

  return (
    <Text
      style={[
        variantStyle[variant],
        { color: toneColor[tone] },
        weight ? { fontWeight: fontWeight[weight] } : null,
        style,
      ]}
      {...rest}
    />
  );
}
