import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { CATEGORIAS } from '@/constants/domain';
import { colors, radius, spacing, TOUCH_MIN } from '@/theme';
import type { Material } from '@/types/api';

interface SeletorMaterialProps {
  materiais: Material[];
  selecionadoId?: number | null;
  onSelecionar: (material: Material) => void;
}

/** Lista de materiais selecionáveis, com a cor da lixeira de cada categoria. */
export function SeletorMaterial({ materiais, selecionadoId, onSelecionar }: SeletorMaterialProps) {
  return (
    <View style={styles.lista}>
      {materiais.map((material) => {
        const categoria = CATEGORIAS[material.categoria];
        const selecionado = material.id === selecionadoId;
        return (
          <Pressable
            key={material.id}
            onPress={() => onSelecionar(material)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selecionado }}
            accessibilityLabel={`${material.nome}, ${categoria.label}`}
            style={[styles.item, selecionado && styles.itemSelecionado]}
          >
            <View style={[styles.bolinha, { backgroundColor: categoria.cor }]}>
              <Ionicons name={categoria.icone} size={16} color={categoria.corTexto} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">{material.nome}</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {categoria.label}
              </AppText>
            </View>
            <Ionicons
              name={selecionado ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selecionado ? colors.primary : colors.border}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: spacing.sm,
  },
  item: {
    minHeight: TOUCH_MIN + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  itemSelecionado: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  bolinha: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
});
