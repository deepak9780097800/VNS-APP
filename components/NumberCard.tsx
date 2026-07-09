import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui';
import {
  discountPercent,
  formatINR,
  hasDiscount,
  parsePrice,
  patternTags,
  sellerTier,
} from '@/lib/api/format';
import type { VipNumber } from '@/lib/api/types';
import { useTheme } from '@/theme';

export interface NumberCardProps {
  item: VipNumber;
  onPress?: (item: VipNumber) => void;
}

export function NumberCard({ item, onPress }: NumberCardProps) {
  const theme = useTheme();

  const gstPrice = parsePrice(item.price_with_gst) || parsePrice(item.unit_price);
  const showDiscount = hasDiscount(item);
  const discount = discountPercent(item);
  const isPremium = sellerTier(item) === 'premium';
  const isSponsored = item.star_status?.toLowerCase() === 'sponsored';
  const tags = patternTags(item);
  const title = item.productname?.trim() || item.number;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isPremium ? theme.colors.accent : theme.colors.border,
          borderRadius: theme.radii.md,
          padding: theme.spacing.base,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <ThemedText variant="heading" style={styles.number}>
          {title}
        </ThemedText>
        <View style={styles.badges}>
          {isSponsored ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.textSecondary }]}>
              <ThemedText variant="caption" tone="inverse" weight="semibold">
                SPONSORED
              </ThemedText>
            </View>
          ) : null}
          <View
            style={[
              styles.badge,
              { backgroundColor: isPremium ? theme.colors.accent : theme.colors.border },
            ]}
          >
            <ThemedText
              variant="caption"
              tone={isPremium ? 'primary' : 'secondary'}
              weight="semibold"
            >
              {isPremium ? '★ PREMIUM' : 'BASIC'}
            </ThemedText>
          </View>
        </View>
      </View>

      {tags.length ? (
        <View style={styles.tagRow}>
          {tags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tag,
                { backgroundColor: theme.colors.accent + '22', borderRadius: theme.radii.full },
              ]}
            >
              <ThemedText variant="caption" tone="accent" weight="semibold">
                {tag}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.priceRow}>
        <ThemedText variant="title" tone="accent" weight="bold">
          {formatINR(gstPrice)}
        </ThemedText>
        {showDiscount ? (
          <>
            <ThemedText variant="label" tone="secondary" style={styles.mrp}>
              {formatINR(parsePrice(item.compare_at_price))}
            </ThemedText>
            {discount > 0 ? (
              <ThemedText variant="label" tone="success" weight="semibold">
                {discount}% off
              </ThemedText>
            ) : null}
          </>
        ) : null}
      </View>
      <ThemedText variant="caption" tone="secondary">
        incl. GST
      </ThemedText>
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
    alignItems: 'flex-start',
    gap: 8,
  },
  number: { letterSpacing: 1, flexShrink: 1 },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' },
  badge: {
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
