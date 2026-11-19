import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText, ProgressBar } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';
import type { ResumoGamificacao } from '@/types/gamificacao';

interface NivelCardProps {
  resumo: ResumoGamificacao;
  demonstracao?: boolean;
}

/** Destaque de nível, XP e pontos (lima reservado para a gamificação). */
export function NivelCard({ resumo, demonstracao = false }: NivelCardProps) {
  const progresso = resumo.xpProximoNivel > 0 ? resumo.xp / resumo.xpProximoNivel : 1;
  const faltam = Math.max(resumo.xpProximoNivel - resumo.xp, 0);

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`Nível ${resumo.nivel}, ${resumo.xp} de ${resumo.xpProximoNivel} XP, ${resumo.pontos} pontos`}
    >
      <View style={styles.topo}>
        <View style={styles.flex}>
          <AppText variant="label" color={colors.accent}>
            SEU NÍVEL
          </AppText>
          <AppText variant="title" color={colors.textOnPrimary}>
            {resumo.nivel}
          </AppText>
        </View>
        <View style={styles.pontos}>
          <Ionicons name="star" size={18} color={colors.primaryDark} />
          <AppText variant="bodyStrong" color={colors.primaryDark}>
            {resumo.pontos} pts
          </AppText>
        </View>
      </View>

      <ProgressBar progresso={progresso} />

      <AppText variant="caption" color="#D7EBDF">
        {resumo.xp} / {resumo.xpProximoNivel} XP
        {resumo.proximoNivel ? ` · faltam ${faltam} para ${resumo.proximoNivel}` : ''}
      </AppText>

      {demonstracao && (
        <AppText variant="caption" color="#B9D7C4">
          Dados de demonstração · integração com a API de gamificação em andamento
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  pontos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
});
