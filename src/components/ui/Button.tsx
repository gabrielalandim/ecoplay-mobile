import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { colors, radius, spacing, TOUCH_MIN } from '@/theme';

type Variante = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variante;
  icon?: ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

const estilosVariante: Record<Variante, { fundo: string; texto: string; borda: string }> = {
  primary: { fundo: colors.primary, texto: colors.textOnPrimary, borda: colors.primary },
  secondary: { fundo: colors.primarySoft, texto: colors.primaryDark, borda: colors.primarySoft },
  outline: { fundo: 'transparent', texto: colors.primary, borda: colors.primary },
  ghost: { fundo: 'transparent', texto: colors.primary, borda: 'transparent' },
  danger: { fundo: colors.danger, texto: colors.textOnPrimary, borda: colors.danger },
  accent: { fundo: colors.accent, texto: colors.primaryDark, borda: colors.accent },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  compact = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const cores = estilosVariante[variant];
  const inativo = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inativo, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: cores.fundo, borderColor: cores.borda },
        pressed && !inativo && styles.pressed,
        inativo && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={cores.texto} />
      ) : (
        <View style={styles.conteudo}>
          {icon && <Ionicons name={icon} size={20} color={cores.texto} />}
          <AppText variant="bodyStrong" color={cores.texto}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH_MIN + 4,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    minHeight: TOUCH_MIN,
    paddingHorizontal: spacing.lg,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
