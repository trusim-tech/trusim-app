import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import 'react-native-reanimated';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('logout', () => {
      router.replace('/' as any);
    });
    return () => sub.remove();
  }, [router]);

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="checking" options={{ headerShown: false }} />
        <Stack.Screen name="confirmed" options={{ headerShown: false }} />
        <Stack.Screen name="map" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" hidden />
    </ThemeProvider>
  );
}
