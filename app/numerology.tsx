import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Card, Screen, ThemedText } from '@/components/ui';
import { analyze } from '@/lib/numerology/engine';
import { useTheme } from '@/theme';

export default function NumerologyScreen() {
  const theme = useTheme();
  const [value, setValue] = useState('');

  const result = useMemo(() => analyze(value), [value]);
  const hasDigits = value.replace(/\D/g, '').length > 0;

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Numerology checker' }} />

      <ThemedText tone="secondary" style={styles.sub}>
        Enter any mobile number to see its Vedic numerology reading.
      </ThemedText>

      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Enter a number"
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

      {hasDigits ? (
        <Card style={styles.result}>
          <Row label="Total" value={String(result.total)} />
          <Row label="Bhagyank (root)" value={String(result.root)} />
          <Row label="Ruling planet" value={result.planet} />
          <Row label="Luck score" value={`${result.luckScore}/100`} />
          <Row
            label="Missing digits"
            value={result.missingDigits.length ? result.missingDigits.join(', ') : 'None'}
          />
          <ThemedText tone="secondary" style={styles.summary}>
            {result.summary}
          </ThemedText>
        </Card>
      ) : null}
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
  sub: { marginBottom: 16 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 20,
    letterSpacing: 2,
  },
  result: { marginTop: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summary: { marginTop: 12 },
});
