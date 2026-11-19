import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { colors, fonts } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Estilo compartilhado das barras de abas (cidadão e cooperativa). */
export const tabBarOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: { fontFamily: fonts.bodySemiBold, fontSize: 12 },
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    minHeight: 64,
    paddingTop: 6,
  },
} as const;

/** Ícone de aba que alterna entre a versão preenchida (ativa) e o contorno. */
export function tabIcon(ativo: IconName, inativo: IconName) {
  function TabIcon({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) {
    return <Ionicons name={focused ? ativo : inativo} size={size} color={String(color)} />;
  }
  return TabIcon;
}
