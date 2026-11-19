import { StyleSheet, View } from 'react-native';

import { AppText, CategoriaBadge } from '@/components/ui';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { colors, spacing } from '@/theme';
import type { EntregaItem } from '@/types/api';
import { formatarPeso, somarPesos } from '@/utils/format';

/** Lista os materiais de uma entrega com o peso de cada um e o total. */
export function ItensEntrega({ itens }: { itens: EntregaItem[] }) {
  const { materialPorId } = useCatalogo();
  return (
    <View style={styles.container}>
      {itens.map((item) => {
        const material = materialPorId(item.materialId);
        return (
          <View key={item.id} style={styles.item}>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">
                {material?.nome ?? `Material #${item.materialId}`}
              </AppText>
              {material && <CategoriaBadge categoria={material.categoria} />}
            </View>
            <AppText variant="bodyStrong">{formatarPeso(Number(item.pesoKg))}</AppText>
          </View>
        );
      })}
      <View style={[styles.item, styles.total]}>
        <AppText variant="bodyStrong" color={colors.textMuted}>
          Total
        </AppText>
        <AppText variant="subtitle" color={colors.primaryDark}>
          {formatarPeso(somarPesos(itens))}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: spacing.xs,
  },
  total: {
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
