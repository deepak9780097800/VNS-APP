import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { specialityTags } from '@/components/NumberCard';
import { Button, Card, Screen, ThemedText } from '@/components/ui';
import { formatINR, isComingSoon, parsePrice } from '@/lib/api/format';
import { getNumber } from '@/lib/api/numbers';
import { analyze } from '@/lib/numerology/engine';
import { useTheme } from '@/theme';

export default function NumberDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['numbers', 'detail', id],
    queryFn: () => getNumber(String(id)),
    enabled: !!id,
  });

  const numerology = data ? analyze(data.number) : null;
  const price = data ? parsePrice(data.unit_price) : 0;
  const mrp = data ? parsePrice(data.compare_at_price) : 0;
  const isPremium = data?.seller_type === 'PREMIUM';
  const tags = data ? specialityTags(data.speciality) : [];
  const comingSoon = data ? isComingSoon(data) : false;

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Number details' }} />

      {isLoading ? (
        <ThemedText tone="secondary">Loading…</ThemedText>
      ) : isError || !data ? (
        <ThemedText tone="danger">Could not load this number.</ThemedText>
      ) : (
        <>
          <Card style={styles.section}>
            <ThemedText variant="display" tone="primary" style={styles.number}>
              {data.productname?.trim() || data.number}
            </ThemedText>
            <ThemedText tone="secondary">
              {isPremium ? '★ Premium' : 'Basic'}
              {data.rating ? ` · ${data.rating}★` : ''}
            </ThemedText>

            <View style={styles.priceRow}>
              <ThemedText variant="title" tone="accent" weight="bold">
                {formatINR(price)}
              </ThemedText>
              {mrp > price ? (
                <ThemedText tone="secondary" style={styles.mrp}>
                  {formatINR(mrp)}
                </ThemedText>
              ) : null}
            </View>

            {tags.length ? (
              <View style={styles.tags}>
                {tags.map((t) => (
                  <View
                    key={t}
                    style={[styles.tag, { backgroundColor: theme.colors.accent + '22', borderRadius: theme.radii.full }]}
                  >
                    <ThemedText variant="caption" tone="accent" weight="semibold">
                      {t}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}

            {comingSoon ? (
              <ThemedText tone="secondary" style={styles.coming}>
                {data.comingsoon_date ? `Coming soon · ${data.comingsoon_date}` : 'Coming soon'}
              </ThemedText>
            ) : null}
          </Card>

          {numerology ? (
            <Card style={styles.section}>
              <ThemedText variant="heading" style={styles.numTitle}>
                Numerology
              </ThemedText>
              <Row label="Total (backend)" value={String(data.total)} />
              <Row label="Total (computed)" value={String(numerology.total)} />
              <Row label="Sum (backend)" value={String(data.sum)} />
              <Row label="Bhagyank (root)" value={String(numerology.root)} />
              <Row label="Ruling planet" value={numerology.planet} />
              <Row label="Luck score" value={`${numerology.luckScore}/100`} />
              <Row
                label="Missing digits"
                value={numerology.missingDigits.length ? numerology.missingDigits.join(', ') : 'None'}
              />
              <ThemedText tone="secondary" style={styles.summary}>
                {numerology.summary}
              </ThemedText>
            </Card>
          ) : null}

          <Button
            title={comingSoon ? (data.card_btn_text || 'Pre-book this number') : (data.card_btn_text || 'Buy this number')}
            variant="accent"
          />
        </>
      )}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText tone="secondary" variant="label">
        {label}
      </ThemedText>
      <ThemedText variant="label" weight="semibold">
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  number: { letterSpacing: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  mrp: { textDecorationLine: 'line-through' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 4 },
  coming: { marginTop: 12 },
  numTitle: { marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summary: { marginTop: 12 },
});
