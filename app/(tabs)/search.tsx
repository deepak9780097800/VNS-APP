import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { NumberCard } from '@/components/NumberCard';
import { Screen, ThemedText } from '@/components/ui';
import { searchNumbers } from '@/lib/api/numbers';
import type { Operator, SearchNumbersParams } from '@/lib/api/types';
import { useTheme } from '@/theme';

const OPERATORS: Operator[] = ['Airtel', 'Jio', 'Vi', 'BSNL'];

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [operator, setOperator] = useState<Operator | undefined>();

  const params = useMemo<SearchNumbersParams>(
    () => ({ query: query || undefined, operator }),
    [query, operator],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['numbers', 'search', params],
    queryFn: () => searchNumbers(params),
  });

  const results = data ?? [];

  return (
    <Screen scroll={false}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search numbers e.g. 786, 99999…"
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType="number-pad"
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.md,
            color: theme.colors.textPrimary,
          },
        ]}
      />

      <View style={styles.filterRow}>
        {OPERATORS.map((op) => {
          const active = operator === op;
          return (
            <Pressable
              key={op}
              onPress={() => setOperator(active ? undefined : op)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                  borderRadius: theme.radii.full,
                },
              ]}
            >
              <ThemedText variant="label" tone={active ? 'inverse' : 'secondary'} weight="medium">
                {op}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <ThemedText tone="secondary">Loading…</ThemedText>
      ) : results.length === 0 ? (
        <ThemedText tone="secondary">No numbers match your filters.</ThemedText>
      ) : (
        <FlashList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NumberCard item={item} onPress={(n) => router.push(`/number/${n.id}`)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  list: { paddingBottom: 24 },
});
