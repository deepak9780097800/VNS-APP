import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button, Screen, ThemedText } from '@/components/ui';
import { requestOtp, verifyOtp } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth';
import { useTheme } from '@/theme';

type Step = 'phone' | 'otp';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      color: theme.colors.textPrimary,
    },
  ];

  async function handleRequestOtp() {
    if (phone.trim().length < 10) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await requestOtp(phone.trim());
      setStep('otp');
      setHint(res.devOtp ? `Dev OTP: ${res.devOtp}` : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await verifyOtp(phone.trim(), otp.trim());
      await login(token, user);
      router.replace('/(tabs)/account');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <ThemedText variant="title" style={styles.heading}>
        {step === 'phone' ? 'Enter your phone' : 'Enter the OTP'}
      </ThemedText>
      <ThemedText tone="secondary" style={styles.sub}>
        {step === 'phone'
          ? 'We will send a one-time password to verify your number.'
          : `Sent to +91 ${phone}`}
      </ThemedText>

      {step === 'phone' ? (
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="10-digit mobile number"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          maxLength={10}
          style={inputStyle}
        />
      ) : (
        <TextInput
          value={otp}
          onChangeText={setOtp}
          placeholder="4-digit OTP"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          maxLength={4}
          style={inputStyle}
        />
      )}

      {hint ? (
        <ThemedText tone="accent" variant="caption" style={styles.hint}>
          {hint}
        </ThemedText>
      ) : null}
      {error ? (
        <ThemedText tone="danger" variant="label" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      <View style={styles.actions}>
        {step === 'phone' ? (
          <Button title="Send OTP" loading={loading} onPress={handleRequestOtp} />
        ) : (
          <>
            <Button title="Verify & continue" loading={loading} onPress={handleVerifyOtp} />
            <Button
              title="Change number"
              variant="ghost"
              onPress={() => {
                setStep('phone');
                setOtp('');
                setError(null);
                setHint(null);
              }}
            />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: 6 },
  sub: { marginBottom: 24 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 18,
    letterSpacing: 2,
  },
  hint: { marginTop: 10 },
  error: { marginTop: 10 },
  actions: { marginTop: 24, gap: 8 },
});
