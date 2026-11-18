import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, radius, spacing, TOUCH_MIN } from '@/theme';

interface Opcao<T extends string> {
  valor: T;
  label: string;
  icone?: ComponentProps<typeof Ionicons>['name'];
}

interface SegmentedControlProps<T extends string> {
  opcoes: Opcao<T>[];
  valor: T;
  onChange: (valor: T) => void;
  accessibilityLabel?: string;
}

export function SegmentedControl<T extends string>({
  opcoes,
  valor,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  return (
    <View
      style={styles.container}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valor;
        const cor = ativo ? colors.textOnPrimary : colors.primaryDark;
        return (
          <Pressable
            key={opcao.valor}
            onPress={() => onChange(opcao.valor)}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            accessibilityLabel={opcao.label}
            style={[styles.opcao, ativo && styles.ativo]}
          >
            {opcao.icone && <Ionicons name={opcao.icone} size={18} color={cor} />}
            <AppText variant="captionStrong" color={cor}>
              {opcao.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  opcao: {
    flex: 1,
    minHeight: TOUCH_MIN - 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.sm,
  },
  ativo: {
    backgroundColor: colors.primary,
  },
});
