import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';
import { ThemedText } from './ThemedText';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const base: ViewStyle = {
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
  };

  const byVariant: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: theme.colors.primary },
    accent: { backgroundColor: theme.colors.accent },
    outline: { backgroundColor: 'transparent', borderColor: theme.colors.primary },
    ghost: { backgroundColor: 'transparent' },
  };

  const tone =
    variant === 'outline' || variant === 'ghost' ? 'primary' : 'inverse';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        base,
        byVariant[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={tone === 'inverse' ? '#FFFFFF' : theme.colors.primary} />
      ) : (
        <ThemedText variant="label" tone={tone} weight="semibold">
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
