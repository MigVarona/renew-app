import { NotoSans_400Regular } from '@expo-google-fonts/noto-sans/400Regular';
import { NotoSans_600SemiBold } from '@expo-google-fonts/noto-sans/600SemiBold';
import { NotoSans_700Bold } from '@expo-google-fonts/noto-sans/700Bold';
import { PTSerif_400Regular } from '@expo-google-fonts/pt-serif/400Regular';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Renew, RenewFonts } from '@/constants/renew-theme';

SplashScreen.preventAutoHideAsync();

const RenewTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Renew.cream,
    card: Renew.paper,
    text: Renew.dark,
    border: Renew.border,
    primary: Renew.sage,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_600SemiBold,
    NotoSans_700Bold,
    PTSerif_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={RenewTheme}>
      <StatusBar style="dark" />
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="articles/[slug]"
          options={{
            title: '',
            headerBackTitle: 'Back',
            headerTintColor: Renew.sage,
            headerStyle: { backgroundColor: Renew.cream },
            headerTitleStyle: { fontFamily: RenewFonts.semibold },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
