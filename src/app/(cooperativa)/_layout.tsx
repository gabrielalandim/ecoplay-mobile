import { Stack } from 'expo-router';

import { CatalogoProvider } from '@/contexts/CatalogoContext';
import { colors } from '@/theme';

/** Área da cooperativa: interface própria, separada da área do cidadão. */
export default function CooperativaLayout() {
  return (
    <CatalogoProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      />
    </CatalogoProvider>
  );
}
