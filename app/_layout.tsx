import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ensureThreeNativePolyfills } from '@/src/infrastructure/three-polyfills';
import { AppProvider } from '@/src/context/app-context';
import { AppColors } from '@/src/presentation/theme/colors';

ensureThreeNativePolyfills();

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AppProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: AppColors.background },
            headerShadowVisible: false,
            headerTintColor: AppColors.textPrimary,
            contentStyle: { backgroundColor: AppColors.background },
          }}>
          <Stack.Screen name="index" options={{ title: 'Vital Horizon', headerShown: false }} />
          <Stack.Screen name="surgery-date" options={{ title: 'Ameliyat Tarihi' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </AppProvider>
    </ThemeProvider>
  );
}
