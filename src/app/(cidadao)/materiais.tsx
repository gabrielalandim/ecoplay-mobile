import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { GuiaPreparo } from '@/components/materiais/GuiaPreparo';
import {
  AppText,
  Card,
  CategoriaBadge,
  Chip,
  ChipRow,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/ui';
import { SearchField } from '@/components/ui/SearchField';
import { CATEGORIAS, CATEGORIAS_LISTA } from '@/constants/domain';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { colors, spacing } from '@/theme';
import type { CategoriaMaterial, Material } from '@/types/api';
import { normalizar } from '@/utils/format';

function MaterialItem({ material }: { material: Material }) {
  const [aberto, setAberto] = useState(false);
  return (
    <Card
      onPress={() => setAberto((a) => !a)}
      style={styles.card}
      accessibilityLabel={`${material.nome}. Toque para ${aberto ? 'ocultar' : 'ver'} como preparar`}
    >
      <View style={styles.linha}>
        <View style={styles.flex}>
          <AppText variant="bodyStrong">{material.nome}</AppText>
          <View style={styles.reciclavel}>
            <Ionicons
              name={material.reciclavel ? 'refresh-circle' : 'close-circle'}
              size={16}
              color={material.reciclavel ? colors.primary : colors.danger}
            />
            <AppText variant="caption" color={material.reciclavel ? colors.primary : colors.danger}>
              {material.reciclavel ? 'Reciclável' : 'Não reciclável'}
            </AppText>
          </View>
        </View>
        <CategoriaBadge categoria={material.categoria} />
        <Ionicons
          name={aberto ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </View>
      {aberto && (
        <View style={styles.guia}>
          <AppText variant="captionStrong" color={colors.textMuted}>
            COMO PREPARAR
          </AppText>
          <GuiaPreparo categoria={material.categoria} comoPreparar={material.comoPreparar} />
        </View>
      )}
    </Card>
  );
}

export default function MateriaisScreen() {
  const { materiais, carregando, erro, recarregar } = useCatalogo();
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<CategoriaMaterial | null>(null);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca);
    return materiais.filter(
      (m) =>
        (!categoria || m.categoria === categoria) && (!termo || normalizar(m.nome).includes(termo)),
    );
  }, [materiais, busca, categoria]);

  return (
    <Screen title="Materiais" subtitle="Saiba como preparar cada resíduo." back scroll={false}>
      <SearchField valor={busca} onChange={setBusca} placeholder="Buscar material" />
      <View>
        <ChipRow>
          <Chip label="Todos" selected={!categoria} onPress={() => setCategoria(null)} />
          {CATEGORIAS_LISTA.map((cat) => (
            <Chip
              key={cat}
              label={CATEGORIAS[cat].label}
              selected={categoria === cat}
              color={CATEGORIAS[cat].cor}
              textColor={CATEGORIAS[cat].corTexto}
              onPress={() => setCategoria(categoria === cat ? null : cat)}
            />
          ))}
        </ChipRow>
      </View>

      {carregando && materiais.length === 0 ? (
        <LoadingState mensagem="Carregando materiais..." />
      ) : erro && materiais.length === 0 ? (
        <ErrorState mensagem={erro} onRetry={recarregar} />
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <MaterialItem material={item} />}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={carregando}
              onRefresh={recarregar}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icone="file-tray-outline"
              titulo={materiais.length === 0 ? 'Nenhum material cadastrado' : 'Nada encontrado'}
              descricao={
                materiais.length === 0
                  ? 'Os materiais aparecem aqui assim que forem cadastrados.'
                  : 'Tente outro nome ou categoria.'
              }
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  card: {
    gap: spacing.md,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  reciclavel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  guia: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
