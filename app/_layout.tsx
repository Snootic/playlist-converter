import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // This cleaning exists only bc for some reason google's scopes
  // are being interpreted by expo router as an url
  // so the callback are being imediatelly redirected to it
  // to prevent this, I removed the scope from the params, the backend handles it afterwards
  useEffect(() => {
    async function getUrl() {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl && initialUrl.includes('/callback')) {
        const urlObj = new URL(initialUrl);
        const params = Object.fromEntries(urlObj.searchParams.entries());
        if (params.scope) {
          const cleanParams = new URLSearchParams();

          if (params.code) {
            cleanParams.set('code', params.code);
          }
          if (params.state) {
            cleanParams.set('auth_state', params.state);
          }
          if (params.error) {
            cleanParams.set('error', params.error);
          }

          const cleanedUrl = `/callback?${cleanParams.toString()}` as const;
          router.replace(cleanedUrl);
        }
      }
    }
    getUrl();
  }, []);


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
