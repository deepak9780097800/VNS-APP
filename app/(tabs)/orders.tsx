import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, ThemedText } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';

export default function OrdersScreen() {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return (
      <Screen>
        <View style={styles.center}>
          <ThemedText variant="display">🧾</ThemedText>
          <ThemedText variant="heading" style={styles.title}>
            Sign in to view orders
          </ThemedText>
          <ThemedText tone="secondary" style={styles.sub}>
            Your purchases and their status will appear here.
          </ThemedText>
          <Link href="/(auth)/login" asChild>
            <Button title="Sign in" style={styles.cta} />
          </Link>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.center}>
        <ThemedText variant="heading">No orders yet</ThemedText>
        <ThemedText tone="secondary" style={styles.sub}>
          When you buy a number, it will show up here.
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingTop: 80, gap: 8 },
  title: { marginTop: 12 },
  sub: { textAlign: 'center' },
  cta: { marginTop: 20, minWidth: 200 },
});
