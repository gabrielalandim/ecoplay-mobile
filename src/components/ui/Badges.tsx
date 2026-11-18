import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { CATEGORIAS, STATUS_ENTREGA } from '@/constants/domain';
import { radius, spacing } from '@/theme';
import type { CategoriaMaterial, StatusEntrega } from '@/types/api';

export function StatusBadge({ status }: { status: StatusEntrega }) {
  const info = STATUS_ENTREGA[status];
  return (
    <View
      style={[styles.badge, { backgroundColor: info.fundo }]}
      accessibilityLabel={`Status: ${info.label}`}
    >
      <Ionicons name={info.icone} size={16} color={info.cor} />
      <AppText variant="captionStrong" color={info.cor}>
        {info.label}
      </AppText>
    </View>
  );
}

export function CategoriaBadge({ categoria }: { categoria: CategoriaMaterial }) {
  const info = CATEGORIAS[categoria];
  return (
    <View
      style={[styles.badge, { backgroundColor: info.cor }]}
      accessibilityLabel={`Categoria: ${info.label}`}
    >
      <Ionicons name={info.icone} size={16} color={info.corTexto} />
      <AppText variant="captionStrong" color={info.corTexto}>
        {info.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
});
