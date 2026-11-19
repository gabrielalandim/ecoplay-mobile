import { Stack } from 'expo-router';

import { CatalogoProvider } from '@/contexts/CatalogoContext';
import { colors } from '@/theme';

/** Área do cidadão: abas principais + telas empilhadas por cima delas. */
export default function CidadaoLayout() {
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
