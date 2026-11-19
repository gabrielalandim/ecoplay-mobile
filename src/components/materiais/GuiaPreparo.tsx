import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { CATEGORIAS, GUIA_PREPARO } from '@/constants/domain';
import { colors, spacing } from '@/theme';
import type { CategoriaMaterial } from '@/types/api';

interface GuiaPreparoProps {
  categoria: CategoriaMaterial;
  /** Texto cadastrado no material (API Java). Tem prioridade sobre o guia padrão. */
  comoPreparar?: string | null;
}

/** Passo a passo de como preparar o resíduo antes do descarte. */
export function GuiaPreparo({ categoria, comoPreparar }: GuiaPreparoProps) {
  const passos = comoPreparar?.trim()
    ? comoPreparar
        .split(/\n|;|\. /)
        .map((p) => p.trim().replace(/\.$/, ''))
        .filter(Boolean)
        .map((p) => `${p}.`)
    : GUIA_PREPARO[categoria];
  const info = CATEGORIAS[categoria];

  return (
    <View style={styles.container}>
      {passos.map((passo) => (
        <View key={passo} style={styles.passo}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          <AppText variant="body" style={styles.flex}>
            {passo}
          </AppText>
        </View>
      ))}
      <View style={styles.lixeira}>
        <View style={[styles.cor, { backgroundColor: info.cor }]} />
        <AppText variant="caption" color={colors.textMuted}>
          Lixeira {info.lixeira} na coleta seletiva
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  passo: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
  lixeira: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cor: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
});
