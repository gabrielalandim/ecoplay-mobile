import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';

import { PontoCard } from '@/components/pontos/PontoCard';
import { Banner, Button, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { useRecurso } from '@/hooks/useRecurso';
import { mensagemDeErro } from '@/services/api';
import { pontoDescarteService } from '@/services/pontoDescarteService';
import { colors, spacing } from '@/theme';
import type { PontoDescarte } from '@/types/api';
import { pedirConfirmacao } from '@/utils/dialog';

export default function MeusPontosScreen() {
  const router = useRouter();
  const usuario = useUsuarioLogado();
  const { recarregar: recarregarCatalogo } = useCatalogo();
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<number | null>(null);

  const buscar = useCallback(
    () => pontoDescarteService.listarDaCooperativa(usuario.id),
    [usuario.id],
  );
  const { dados, carregando, atualizando, erro, recarregar, atualizar } = useRecurso(buscar);

  async function handleExcluir(ponto: PontoDescarte) {
    const ok = await pedirConfirmacao({
      titulo: 'Excluir ponto?',
      mensagem: `"${ponto.nome}" deixará de aparecer para os cidadãos.`,
      textoConfirmar: 'Excluir',
      destrutivo: true,
    });
    if (!ok) return;
    setExcluindo(ponto.id);
    setErroAcao(null);
    try {
      await pontoDescarteService.excluir(ponto.id);
      await Promise.all([recarregar(), recarregarCatalogo()]);
    } catch (e) {
      setErroAcao(
        mensagemDeErro(e, 'Não foi possível excluir. O ponto pode ter entregas vinculadas.'),
      );
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <Screen
      title="Meus pontos"
      subtitle="Locais onde sua cooperativa recebe materiais."
      scroll={false}
      footer={
        <Button title="Cadastrar ponto" icon="add" onPress={() => router.push('/ponto-form')} />
      }
    >
      {erroAcao && <Banner tipo="erro" mensagem={erroAcao} />}

      {carregando && !dados ? (
        <LoadingState />
      ) : erro && !dados ? (
        <ErrorState mensagem={erro} onRetry={recarregar} />
      ) : (
        <FlatList
          data={dados ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={atualizar}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <PontoCard
              ponto={item}
              acoes={
                <>
                  <Button
                    title="Editar"
                    icon="create-outline"
                    variant="outline"
                    compact
                    style={styles.flex}
                    onPress={() => router.push(`/ponto-form?id=${item.id}`)}
                  />
                  <Button
                    title="Excluir"
                    icon="trash-outline"
                    variant="ghost"
                    compact
                    style={styles.flex}
                    loading={excluindo === item.id}
                    onPress={() => handleExcluir(item)}
                  />
                </>
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icone="location-outline"
              titulo="Nenhum ponto cadastrado"
              descricao="Cadastre seus pontos para que os cidadãos possam agendar entregas."
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
    paddingBottom: spacing.xxl,
  },
  flex: {
    flex: 1,
  },
});
