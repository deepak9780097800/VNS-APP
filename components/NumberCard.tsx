import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui';
import { formatINR, isComingSoon, parsePrice } from '@/lib/api/format';
import type { VipNumber } from '@/lib/api/types';
import { useTheme } from '@/theme';

export interface NumberCardProps {
  item: VipNumber;
  onPress?: (item: VipNumber) => void;
}

/** Split the backend's comma/pipe-separated speciality string into tags. */
export function specialityTags(speciality: string | undefined): string[] {
  if (!speciality) return [];
  return speciality
    .split(/[,|/]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function NumberCard({ item, onPress }: NumberCardProps) {
  const theme = useTheme();

  const price = parsePrice(item.unit_price);
  const mrp = parsePrice(item.compare_at_price);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const isPremium = item.seller_type === 'PREMIUM';
  const isSponsored = item.star_status?.toLowerCase() === 'sponsored';
  const comingSoon = isComingSoon(item);
  const tags = specialityTags(item.speciality);
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
          {formatINR(price)}
        </ThemedText>
        {discount > 0 ? (
          <>
            <ThemedText variant="label" tone="secondary" style={styles.mrp}>
              {formatINR(mrp)}
            </ThemedText>
            <ThemedText variant="label" tone="success" weight="semibold">
              {discount}% off
            </ThemedText>
          </>
        ) : null}
      </View>

      {comingSoon ? (
        <ThemedText variant="caption" tone="secondary" style={styles.coming}>
          {item.comingsoon_date ? `Coming soon · ${item.comingsoon_date}` : 'Coming soon'}
        </ThemedText>
      ) : null}
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
  coming: { marginTop: 8 },
});
