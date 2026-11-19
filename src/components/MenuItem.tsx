import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './ui';
import { colors, radius, spacing, TOUCH_MIN } from '@/theme';

interface MenuItemProps {
  titulo: string;
  icone: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  perigo?: boolean;
}

export function MenuItem({ titulo, icone, onPress, perigo = false }: MenuItemProps) {
  const cor = perigo ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      <View style={[styles.icone, perigo && { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name={icone} size={20} color={perigo ? colors.danger : colors.primary} />
      </View>
      <AppText variant="bodyStrong" color={cor} style={styles.flex}>
        {titulo}
      </AppText>
      {!perigo && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: TOUCH_MIN + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.primarySoft,
  },
  icone: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
});
