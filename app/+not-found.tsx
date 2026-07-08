import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen, ThemedText } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={styles.center}>
        <ThemedText variant="display">🔍</ThemedText>
        <ThemedText variant="heading" style={styles.title}>
          This screen doesn&apos;t exist.
        </ThemedText>
        <Link href="/(tabs)" style={styles.link}>
          <ThemedText tone="accent" weight="semibold">
            Go to home
          </ThemedText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingTop: 80, gap: 8 },
  title: { marginTop: 12 },
  link: { marginTop: 16 },
});
