import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, StatusBadge } from '@/components/ui';
import { MOTIVOS_RECUSA } from '@/constants/domain';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { colors, spacing } from '@/theme';
import type { Entrega } from '@/types/api';
import { formatarDataCurta, formatarPeso, somarPesos } from '@/utils/format';

interface EntregaCardProps {
  entrega: Entrega;
  onPress: () => void;
}

/** Resumo de uma entrega: data, ponto, materiais, peso e status. */
export function EntregaCard({ entrega, onPress }: EntregaCardProps) {
  const { pontoPorId, materialPorId } = useCatalogo();
  const ponto = pontoPorId(entrega.pontoId);
  const materiais = entrega.itens
    .map((item) => materialPorId(item.materialId)?.nome ?? `Material #${item.materialId}`)
    .join(', ');

  return (
    <Card
      onPress={onPress}
      style={styles.card}
      accessibilityLabel={`Entrega de ${formatarDataCurta(entrega.dataPrevista)}`}
    >
      <View style={styles.topo}>
        <View style={styles.data}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <AppText variant="bodyStrong">{formatarDataCurta(entrega.dataPrevista)}</AppText>
        </View>
        <StatusBadge status={entrega.status} />
      </View>

      <AppText variant="body" numberOfLines={1}>
        {ponto?.nome ?? `Ponto #${entrega.pontoId}`}
      </AppText>
      <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>
        {materiais} · {formatarPeso(somarPesos(entrega.itens))}
      </AppText>

      {entrega.status === 'RECUSADA' && entrega.motivoRecusa && (
        <View style={styles.recusa}>
          <Ionicons name="information-circle" size={16} color={colors.danger} />
          <AppText variant="caption" color={colors.danger} style={styles.flex}>
            {MOTIVOS_RECUSA[entrega.motivoRecusa]}
            {entrega.observacao ? ` — ${entrega.observacao}` : ''}
          </AppText>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs + 2,
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  data: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recusa: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  flex: {
    flex: 1,
  },
});
