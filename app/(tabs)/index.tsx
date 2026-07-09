import { useQuery } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { NumberCard } from '@/components/NumberCard';
import { Card, Screen, ThemedText } from '@/components/ui';
import { searchNumbers } from '@/lib/api/numbers';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['numbers', 'featured'],
    queryFn: () => searchNumbers({}),
  });

  const featured = (data ?? []).slice(0, 3);

  return (
    <Screen>
      <View style={[styles.hero, { backgroundColor: theme.colors.primary, borderRadius: theme.radii.lg }]}>
        <ThemedText variant="display" tone="inverse">
          VNS
        </ThemedText>
        <ThemedText variant="body" tone="inverse" style={styles.heroSub}>
          Premium & VIP mobile numbers, curated for you.
        </ThemedText>
      </View>

      <View style={styles.quickRow}>
        <Link href="/numerology" asChild>
          <Card style={styles.quickCard}>
            <ThemedText variant="heading" tone="accent">
              🔢 Numerology
            </ThemedText>
            <ThemedText variant="caption" tone="secondary">
              Check any number
            </ThemedText>
          </Card>
        </Link>
        <Link href="/chat" asChild>
          <Card style={styles.quickCard}>
            <ThemedText variant="heading" tone="accent">
              💬 Ask VNS
            </ThemedText>
            <ThemedText variant="caption" tone="secondary">
              AI assistant
            </ThemedText>
          </Card>
        </Link>
      </View>

      <ThemedText variant="title" style={styles.sectionTitle}>
        Featured numbers
      </ThemedText>

      {isLoading ? (
        <ThemedText tone="secondary">Loading…</ThemedText>
      ) : (
        featured.map((item) => (
          <NumberCard
            key={String(item.productid)}
            item={item}
            onPress={(n) => router.push(`/number/${n.productid}`)}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 24,
    marginBottom: 20,
  },
  heroSub: { marginTop: 6, opacity: 0.9 },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickCard: { flex: 1 },
  sectionTitle: { marginBottom: 12 },
});
