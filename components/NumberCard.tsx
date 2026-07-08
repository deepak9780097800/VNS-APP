import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui';
import type { VipNumber } from '@/lib/api/types';
import { useTheme } from '@/theme';

export interface NumberCardProps {
  item: VipNumber;
  onPress?: (item: VipNumber) => void;
}

function formatPrice(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function NumberCard({ item, onPress }: NumberCardProps) {
  const theme = useTheme();
  const discount =
    item.mrp > item.price
      ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
      : 0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
          padding: theme.spacing.base,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <ThemedText variant="heading" style={styles.number}>
          {item.number}
        </ThemedText>
        {item.isFreshStock ? (
          <View style={[styles.freshBadge, { backgroundColor: theme.colors.success }]}>
            <ThemedText variant="caption" tone="inverse" weight="semibold">
              FRESH
            </ThemedText>
          </View>
        ) : null}
      </View>

      <ThemedText variant="label" tone="secondary" style={styles.meta}>
        {item.operator} · {item.category}
      </ThemedText>

      <View style={styles.tagRow}>
        {item.patternTags.map((tag) => (
          <View
            key={tag}
            style={[
              styles.tag,
              {
                backgroundColor: theme.colors.accent + '22',
                borderRadius: theme.radii.full,
              },
            ]}
          >
            <ThemedText variant="caption" tone="accent" weight="semibold">
              {tag}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.priceRow}>
        <ThemedText variant="title" tone="accent" weight="bold">
          {formatPrice(item.price)}
        </ThemedText>
        {discount > 0 ? (
          <>
            <ThemedText variant="label" tone="secondary" style={styles.mrp}>
              {formatPrice(item.mrp)}
            </ThemedText>
            <ThemedText variant="label" tone="success" weight="semibold">
              {discount}% off
            </ThemedText>
          </>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  number: { letterSpacing: 1 },
  meta: { marginTop: 2 },
  freshBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  mrp: { textDecorationLine: 'line-through' },
});
