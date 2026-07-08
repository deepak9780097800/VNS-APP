import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Screen, ThemedText } from '@/components/ui';
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
              {data.number}
            </ThemedText>
            <ThemedText tone="secondary">
              {data.operator} · {data.category}
            </ThemedText>
            <View style={styles.priceRow}>
              <ThemedText variant="title" tone="accent" weight="bold">
                ₹{data.price.toLocaleString('en-IN')}
              </ThemedText>
              {data.mrp > data.price ? (
                <ThemedText tone="secondary" style={styles.mrp}>
                  ₹{data.mrp.toLocaleString('en-IN')}
                </ThemedText>
              ) : null}
            </View>
            <View style={styles.tags}>
              {data.patternTags.map((t) => (
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
          </Card>

          {numerology ? (
            <Card style={styles.section}>
              <ThemedText variant="heading" style={styles.numTitle}>
                Numerology
              </ThemedText>
              <Row label="Total" value={String(numerology.total)} />
              <Row label="Bhagyank (root)" value={String(numerology.root)} />
              <Row label="Ruling planet" value={numerology.planet} />
              <Row
                label="Luck score"
                value={`${numerology.luckScore}/100`}
              />
              <Row
                label="Missing digits"
                value={numerology.missingDigits.length ? numerology.missingDigits.join(', ') : 'None'}
              />
              <ThemedText tone="secondary" style={styles.summary}>
                {numerology.summary}
              </ThemedText>
            </Card>
          ) : null}

          <Button title="Buy this number" variant="accent" />
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
  numTitle: { marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summary: { marginTop: 12 },
});
