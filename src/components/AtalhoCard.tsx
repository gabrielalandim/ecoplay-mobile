import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './ui';
import { colors, radius, shadow, spacing } from '@/theme';

interface AtalhoCardProps {
  titulo: string;
  descricao: string;
  icone: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}

export function AtalhoCard({ titulo, descricao, icone, onPress }: AtalhoCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${descricao}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.icone}>
        <Ionicons name={icone} size={22} color={colors.primary} />
      </View>
      <AppText variant="bodyStrong">{titulo}</AppText>
      <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>
        {descricao}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  icone: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});
