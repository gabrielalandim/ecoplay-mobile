import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EntregaCard } from '@/components/entregas/EntregaCard';
import {
  AppText,
  Chip,
  ChipRow,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/ui';
import { STATUS_ENTREGA } from '@/constants/domain';
import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useRecurso } from '@/hooks/useRecurso';
import { entregaService } from '@/services/entregaService';
import { colors, radius, spacing } from '@/theme';
import type { StatusEntrega } from '@/types/api';

const FILTROS: StatusEntrega[] = ['AGENDADA', 'CONFIRMADA', 'CONCLUIDA', 'RECUSADA'];

export default function EntregasRecebidasScreen() {
  const router = useRouter();
  const usuario = useUsuarioLogado();
  const [filtro, setFiltro] = useState<StatusEntrega | null>('AGENDADA');

  const buscar = useCallback(() => entregaService.listarDaCooperativa(usuario.id), [usuario.id]);
  const { dados, carregando, atualizando, erro, recarregar, atualizar } = useRecurso(buscar);

  const contagem = useMemo(() => {
    const mapa: Record<StatusEntrega, number> = {
      AGENDADA: 0,
      CONFIRMADA: 0,
      CONCLUIDA: 0,
      RECUSADA: 0,
    };
    (dados ?? []).forEach((e) => {
      mapa[e.status] += 1;
    });
    return mapa;
  }, [dados]);

  const lista = useMemo(
    () =>
      (dados ?? [])
        .filter((e) => !filtro || e.status === filtro)
        .sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista)),
    [dados, filtro],
  );

  return (
    <Screen title="Entregas recebidas" subtitle={usuario.nome} scroll={false}>
      <View style={styles.resumo}>
        <View style={[styles.resumoItem, { backgroundColor: STATUS_ENTREGA.AGENDADA.fundo }]}>
          <AppText variant="number" color={STATUS_ENTREGA.AGENDADA.cor}>
            {contagem.AGENDADA}
          </AppText>
          <AppText variant="caption" color={STATUS_ENTREGA.AGENDADA.cor}>
            para confirmar
          </AppText>
        </View>
        <View style={[styles.resumoItem, { backgroundColor: STATUS_ENTREGA.CONFIRMADA.fundo }]}>
          <AppText variant="number" color={STATUS_ENTREGA.CONFIRMADA.cor}>
            {contagem.CONFIRMADA}
          </AppText>
          <AppText variant="caption" color={STATUS_ENTREGA.CONFIRMADA.cor}>
            a receber
          </AppText>
        </View>
      </View>

      <View>
        <ChipRow>
          <Chip label="Todas" selected={!filtro} onPress={() => setFiltro(null)} />
          {FILTROS.map((status) => (
            <Chip
              key={status}
              label={`${STATUS_ENTREGA[status].label} (${contagem[status]})`}
              selected={filtro === status}
              color={STATUS_ENTREGA[status].cor}
              onPress={() => setFiltro(filtro === status ? null : status)}
            />
          ))}
        </ChipRow>
      </View>

      {carregando && !dados ? (
        <LoadingState mensagem="Buscando entregas..." />
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
            <EntregaCard entrega={item} onPress={() => router.push(`/recebida/${item.id}`)} />
          )}
          ListEmptyComponent={
            <EmptyState
              icone="file-tray-outline"
              titulo="Nenhuma entrega por aqui"
              descricao={
                filtro
                  ? `Não há entregas com status "${STATUS_ENTREGA[filtro].label.toLowerCase()}".`
                  : 'Quando cidadãos agendarem entregas nos seus pontos, elas aparecem aqui.'
              }
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  resumo: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  resumoItem: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  lista: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
