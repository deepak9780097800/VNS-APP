import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Screen, ThemedText } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';

export default function AccountScreen() {
  const { user, token, logout } = useAuthStore();

  if (!token) {
    return (
      <Screen>
        <View style={styles.center}>
          <ThemedText variant="display">👤</ThemedText>
          <ThemedText variant="heading" style={styles.title}>
            Welcome to VNS
          </ThemedText>
          <ThemedText tone="secondary" style={styles.sub}>
            Sign in with your phone number to manage orders and wishlist.
          </ThemedText>
          <Link href="/(auth)/login" asChild>
            <Button title="Sign in / Sign up" style={styles.cta} />
          </Link>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={styles.profile}>
        <ThemedText variant="heading">{user?.name ?? 'VNS User'}</ThemedText>
        <ThemedText tone="secondary">{user?.phone}</ThemedText>
      </Card>

      <Button
        title="Log out"
        variant="outline"
        onPress={() => logout()}
        style={styles.logout}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingTop: 80, gap: 8 },
  title: { marginTop: 12 },
  sub: { textAlign: 'center' },
  cta: { marginTop: 20, minWidth: 200 },
  profile: { marginBottom: 20 },
  logout: { marginTop: 8 },
});
