import { StyleSheet, View } from 'react-native';

import { Screen, ThemedText } from '@/components/ui';

export default function WishlistScreen() {
  return (
    <Screen>
      <View style={styles.empty}>
        <ThemedText variant="display">❤️</ThemedText>
        <ThemedText variant="heading" style={styles.title}>
          Your wishlist is empty
        </ThemedText>
        <ThemedText tone="secondary" style={styles.sub}>
          Tap the heart on any number to save it here for later.
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  title: { marginTop: 12 },
  sub: { textAlign: 'center' },
});
