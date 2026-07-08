import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export interface ScreenProps {
  children: ReactNode;
  /** Wrap content in a ScrollView. Default true. */
  scroll?: boolean;
  /** Apply default horizontal/vertical padding. Default true. */
  padded?: boolean;
  edges?: readonly Edge[];
  style?: ViewStyle;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = ['top', 'left', 'right'],
  style,
}: ScreenProps) {
  const theme = useTheme();
  const padding: ViewStyle = padded
    ? { paddingHorizontal: theme.spacing.base, paddingVertical: theme.spacing.base }
    : {};

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[padding, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padding, style]}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
    >
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
