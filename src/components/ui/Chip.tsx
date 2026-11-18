import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from './AppText';
import { colors, radius, spacing, TOUCH_MIN } from '@/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
  /** Cor de destaque quando selecionado (ex.: cor da categoria). */
  color?: string;
  textColor?: string;
}

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  color = colors.primary,
  textColor = colors.textOnPrimary,
}: ChipProps) {
  const corTexto = selected ? textColor : colors.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        selected ? { backgroundColor: color, borderColor: color } : styles.naoSelecionado,
      ]}
    >
      {icon && <Ionicons name={icon} size={16} color={corTexto} />}
      <AppText variant="captionStrong" color={corTexto}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** Linha horizontal rolável de chips (filtros). */
export function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.linha}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: TOUCH_MIN - 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  naoSelecionado: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  linha: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },
});
