import { Stack } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Screen, ThemedText } from '@/components/ui';
import { useTheme } from '@/theme';

export default function ChatScreen() {
  const theme = useTheme();

  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ title: 'Ask VNS' }} />

      <View style={styles.messages}>
        <Card style={styles.bubble}>
          <ThemedText>
            Hi! I&apos;m your VNS assistant. Ask me to find a lucky number, explain a
            numerology reading, or track an order. (AI responses come in a later step.)
          </ThemedText>
        </Card>
      </View>

      <View style={styles.composer}>
        <TextInput
          placeholder="Type a message…"
          placeholderTextColor={theme.colors.textSecondary}
          editable={false}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.full,
              color: theme.colors.textPrimary,
            },
          ]}
        />
        <Button title="Send" fullWidth={false} disabled style={styles.send} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  messages: { flex: 1 },
  bubble: { alignSelf: 'flex-start', maxWidth: '90%' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  send: { paddingHorizontal: 20 },
});
