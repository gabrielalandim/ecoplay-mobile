import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme';
import { fontFiles } from '@/theme/typography';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * Navegação raiz com rotas protegidas por autenticação e por papel:
 * - (auth): somente sem sessão
 * - (cidadao): somente role CIDADAO
 * - (cooperativa): somente role COOPERATIVA
 * Quando a guarda falha, o Expo Router redireciona para "/" (index),
 * que decide o destino correto.
 */
function RootNavigator() {
  const { usuario, carregandoSessao } = useAuth();
  const [fontesCarregadas, erroFontes] = useFonts(fontFiles);
  const pronto = !carregandoSessao && (fontesCarregadas || !!erroFontes);

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync().catch(() => undefined);
  }, [pronto]);

  if (!pronto) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={usuario?.role === 'CIDADAO'}>
        <Stack.Screen name="(cidadao)" />
      </Stack.Protected>
      <Stack.Protected guard={usuario?.role === 'COOPERATIVA'}>
        <Stack.Screen name="(cooperativa)" />
      </Stack.Protected>
      <Stack.Screen name="sobre" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
