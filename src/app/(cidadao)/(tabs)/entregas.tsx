import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';

import { EntregaCard } from '@/components/entregas/EntregaCard';
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SegmentedControl,
} from '@/components/ui';
import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useRecurso } from '@/hooks/useRecurso';
import { entregaService } from '@/services/entregaService';
import { colors, spacing } from '@/theme';
import type { Entrega } from '@/types/api';

type Aba = 'proximas' | 'historico';

function ehProxima(entrega: Entrega) {
  return entrega.status === 'AGENDADA' || entrega.status === 'CONFIRMADA';
}

export default function EntregasScreen() {
  const router = useRouter();
  const usuario = useUsuarioLogado();
  const [aba, setAba] = useState<Aba>('proximas');

  const buscar = useCallback(() => entregaService.listarDoCidadao(usuario.id), [usuario.id]);
  const { dados, carregando, atualizando, erro, recarregar, atualizar } = useRecurso(buscar);

  const lista = useMemo(() => {
    const entregas = dados ?? [];
    return aba === 'proximas'
      ? entregas.filter(ehProxima).sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista))
      : entregas
          .filter((e) => !ehProxima(e))
          .sort((a, b) => b.dataPrevista.localeCompare(a.dataPrevista));
  }, [dados, aba]);

  return (
    <Screen
      title="Minhas entregas"
      subtitle="Acompanhe seus agendamentos e o histórico."
      scroll={false}
      footer={
        <Button
          title="Agendar nova entrega"
          icon="add"
          onPress={() => router.push('/entrega/nova')}
        />
      }
    >
      <SegmentedControl<Aba>
        valor={aba}
        onChange={setAba}
        opcoes={[
          { valor: 'proximas', label: 'Próximas', icone: 'time-outline' },
          { valor: 'historico', label: 'Histórico', icone: 'archive-outline' },
        ]}
      />

      {carregando && !dados ? (
        <LoadingState mensagem="Carregando suas entregas..." />
      ) : erro && !dados ? (
        <ErrorState mensagem={erro} onRetry={recarregar} />
      ) : (
        <FlatList
          data={lista}
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
            <EntregaCard entrega={item} onPress={() => router.push(`/entrega/${item.id}`)} />
          )}
          ListEmptyComponent={
            aba === 'proximas' ? (
              <EmptyState
                icone="calendar-outline"
                titulo="Nenhuma entrega agendada"
                descricao="Agende a entrega dos seus recicláveis em uma cooperativa ou ecoponto."
              />
            ) : (
              <EmptyState
                icone="archive-outline"
                titulo="Seu histórico está vazio"
                descricao="Entregas concluídas e recusadas aparecem aqui."
              />
            )
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
});
