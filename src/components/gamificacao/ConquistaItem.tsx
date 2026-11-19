import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';
import type { Conquista } from '@/types/gamificacao';
import { formatarData } from '@/utils/format';

export function ConquistaItem({ conquista }: { conquista: Conquista }) {
  const { conquistada } = conquista;
  return (
    <View
      style={[styles.item, !conquistada && styles.bloqueada]}
      accessibilityLabel={`${conquista.nome}${conquistada ? ', conquistada' : ', bloqueada'}`}
    >
      <View style={[styles.medalha, conquistada ? styles.medalhaAtiva : styles.medalhaInativa]}>
        <Ionicons
          name={conquistada ? 'ribbon' : 'lock-closed'}
          size={22}
          color={conquistada ? colors.primaryDark : colors.textMuted}
        />
      </View>
      <View style={styles.flex}>
        <AppText variant="bodyStrong">{conquista.nome}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {conquista.descricao}
        </AppText>
        {conquistada && conquista.conquistadaEm && (
          <AppText variant="caption" color={colors.primary}>
            Conquistada em {formatarData(conquista.conquistadaEm)}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bloqueada: {
    opacity: 0.7,
  },
  medalha: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalhaAtiva: {
    backgroundColor: colors.accent,
  },
  medalhaInativa: {
    backgroundColor: colors.border,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
});
