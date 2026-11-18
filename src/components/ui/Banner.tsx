import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

type Tipo = 'info' | 'aviso' | 'erro' | 'sucesso';

const config: Record<
  Tipo,
  { fundo: string; cor: string; icone: ComponentProps<typeof Ionicons>['name'] }
> = {
  info: { fundo: colors.infoSoft, cor: colors.info, icone: 'information-circle' },
  aviso: { fundo: colors.warningSoft, cor: colors.warning, icone: 'warning' },
  erro: { fundo: colors.dangerSoft, cor: colors.danger, icone: 'alert-circle' },
  sucesso: { fundo: colors.primarySoft, cor: colors.primaryDark, icone: 'checkmark-circle' },
};

export function Banner({ tipo = 'info', mensagem }: { tipo?: Tipo; mensagem: string }) {
  const c = config[tipo];
  return (
    <View
      style={[styles.banner, { backgroundColor: c.fundo }]}
      accessibilityRole={tipo === 'erro' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={c.icone} size={20} color={c.cor} />
      <AppText variant="caption" color={c.cor} style={styles.texto}>
        {mensagem}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  texto: {
    flex: 1,
  },
});
