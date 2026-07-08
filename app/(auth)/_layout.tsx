import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function AuthLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Sign in' }} />
    </Stack>
  );
}
