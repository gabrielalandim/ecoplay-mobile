import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { abrirNoMapa, PontoCard } from '@/components/pontos/PontoCard';
import {
  AppText,
  Button,
  Chip,
  ChipRow,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/ui';
import { SearchField } from '@/components/ui/SearchField';
import { CATEGORIAS } from '@/constants/domain';
import { useAuth } from '@/contexts/AuthContext';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { colors, spacing } from '@/theme';
import { normalizar } from '@/utils/format';

export default function PontosScreen() {
  const router = useRouter();
  const { usuario } = useAuth();
  const params = useLocalSearchParams<{ materialId?: string }>();
  const { pontos, materiais, materialPorId, carregando, erro, recarregar } = useCatalogo();

  const [busca, setBusca] = useState('');
  const [materialId, setMaterialId] = useState<number | null>(
    params.materialId ? Number(params.materialId) : null,
  );
  const [bairro, setBairro] = useState<string | null>(null);

  const bairros = useMemo(
    () => Array.from(new Set(pontos.map((p) => p.bairro))).sort((a, b) => a.localeCompare(b)),
    [pontos],
  );

  /** Só oferece como filtro os materiais aceitos por pelo menos um ponto. */
  const materiaisAceitos = useMemo(() => {
    const ids = new Set(pontos.flatMap((p) => p.materiaisAceitosIds));
    return materiais.filter((m) => ids.has(m.id));
  }, [pontos, materiais]);

  const bairroUsuario = usuario?.bairro ?? null;

  const filtrados = useMemo(() => {
    const termo = normalizar(busca);
    const lista = pontos.filter(
      (p) =>
        (!materialId || p.materiaisAceitosIds.includes(materialId)) &&
        (!bairro || p.bairro === bairro) &&
        (!termo ||
          normalizar(p.nome).includes(termo) ||
          normalizar(p.bairro).includes(termo) ||
          normalizar(p.endereco).includes(termo)),
    );
    // Pontos do bairro do usuário aparecem primeiro.
    const meuBairro = bairroUsuario ? normalizar(bairroUsuario) : null;
    return meuBairro
      ? [...lista].sort(
          (a, b) =>
            Number(normalizar(b.bairro) === meuBairro) - Number(normalizar(a.bairro) === meuBairro),
        )
      : lista;
  }, [pontos, busca, materialId, bairro, bairroUsuario]);

  const materialSelecionado = materialId ? materialPorId(materialId) : undefined;

  return (
    <Screen
      title="Onde descartar"
      subtitle={
        materialSelecionado
          ? `Pontos que aceitam ${materialSelecionado.nome.toLowerCase()}`
          : 'Encontre o ponto certo para cada resíduo.'
      }
      back
      scroll={false}
    >
      <SearchField valor={busca} onChange={setBusca} placeholder="Buscar por nome, bairro ou rua" />

      <View style={styles.filtros}>
        <AppText variant="label" color={colors.textMuted}>
          MATERIAL
        </AppText>
        <ChipRow>
          <Chip label="Todos" selected={!materialId} onPress={() => setMaterialId(null)} />
          {materiaisAceitos.map((m) => (
            <Chip
              key={m.id}
              label={m.nome}
              selected={materialId === m.id}
              color={CATEGORIAS[m.categoria].cor}
              textColor={CATEGORIAS[m.categoria].corTexto}
              onPress={() => setMaterialId(materialId === m.id ? null : m.id)}
            />
          ))}
        </ChipRow>
        {bairros.length > 1 && (
          <>
            <AppText variant="label" color={colors.textMuted}>
              BAIRRO
            </AppText>
            <ChipRow>
              <Chip label="Todos" selected={!bairro} onPress={() => setBairro(null)} />
              {bairros.map((b) => (
                <Chip
                  key={b}
                  label={b}
                  selected={bairro === b}
                  icon="location-outline"
                  onPress={() => setBairro(bairro === b ? null : b)}
                />
              ))}
            </ChipRow>
          </>
        )}
      </View>

      {carregando && pontos.length === 0 ? (
        <LoadingState mensagem="Buscando pontos de descarte..." />
      ) : erro && pontos.length === 0 ? (
        <ErrorState mensagem={erro} onRetry={recarregar} />
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={carregando}
              onRefresh={recarregar}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <PontoCard
              ponto={item}
              destaqueMaterialId={materialId}
              acoes={
                <>
                  <Button
                    title="Rota"
                    icon="navigate-outline"
                    variant="outline"
                    compact
                    style={styles.flex}
                    onPress={() => abrirNoMapa(item)}
                  />
                  {usuario?.role === 'CIDADAO' && (
                    <Button
                      title="Agendar"
                      icon="calendar-outline"
                      compact
                      style={styles.flex}
                      onPress={() =>
                        router.push(
                          `/entrega/nova?pontoId=${item.id}${materialId ? `&materialId=${materialId}` : ''}`,
                        )
                      }
                    />
                  )}
                </>
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icone="map-outline"
              titulo={pontos.length === 0 ? 'Nenhum ponto cadastrado' : 'Nenhum ponto encontrado'}
              descricao={
                pontos.length === 0
                  ? 'As cooperativas ainda não cadastraram pontos de descarte.'
                  : 'Tente remover algum filtro.'
              }
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filtros: {
    gap: spacing.sm,
  },
  lista: {
    gap: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  flex: {
    flex: 1,
  },
});
