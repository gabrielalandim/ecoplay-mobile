import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ItensEntrega } from '@/components/entregas/ItensEntrega';
import { LinhaDoTempo } from '@/components/entregas/LinhaDoTempo';
import { SeletorData } from '@/components/entregas/SeletorData';
import { abrirNoMapa, PontoCard } from '@/components/pontos/PontoCard';
import {
  AppText,
  Banner,
  BottomSheet,
  Button,
  Card,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/ui';
import { MOTIVOS_RECUSA } from '@/constants/domain';
import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { useRecurso } from '@/hooks/useRecurso';
import { mensagemDeErro } from '@/services/api';
import { entregaService } from '@/services/entregaService';
import { colors, spacing } from '@/theme';
import { pedirConfirmacao } from '@/utils/dialog';
import { formatarData, formatarDataCurta } from '@/utils/format';

export default function DetalheEntregaScreen() {
  const router = useRouter();
  const usuario = useUsuarioLogado();
  const { pontoPorId } = useCatalogo();
  const { id, criada } = useLocalSearchParams<{ id: string; criada?: string }>();
  const entregaId = Number(id);

  const buscar = useCallback(
    () => entregaService.buscarDoCidadao(entregaId, usuario.id),
    [entregaId, usuario.id],
  );
  const { dados: entrega, carregando, erro, recarregar, setDados } = useRecurso(buscar);

  const [reagendando, setReagendando] = useState(false);
  const [novaData, setNovaData] = useState<string | null>(null);
  const [processando, setProcessando] = useState<'reagendar' | 'excluir' | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(
    criada ? 'Entrega agendada! Leve os materiais limpos e separados na data escolhida.' : null,
  );

  async function handleReagendar() {
    if (!entrega || !novaData) return;
    setProcessando('reagendar');
    setErroAcao(null);
    try {
      const atualizada = await entregaService.reagendar(entrega.id, usuario.id, novaData);
      setDados(atualizada);
      setReagendando(false);
      setSucesso(`Entrega reagendada para ${formatarDataCurta(novaData)}.`);
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível reagendar.'));
    } finally {
      setProcessando(null);
    }
  }

  async function handleExcluir() {
    if (!entrega) return;
    const confirmado = await pedirConfirmacao({
      titulo: 'Cancelar agendamento?',
      mensagem: 'A entrega será excluída e a cooperativa não vai mais esperar por ela.',
      textoConfirmar: 'Cancelar entrega',
      destrutivo: true,
    });
    if (!confirmado) return;

    setProcessando('excluir');
    setErroAcao(null);
    try {
      await entregaService.excluir(entrega.id, usuario.id);
      router.back();
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível cancelar a entrega.'));
      setProcessando(null);
    }
  }

  if (carregando && !entrega) {
    return (
      <Screen title="Entrega" back>
        <LoadingState />
      </Screen>
    );
  }
  if (erro || !entrega) {
    return (
      <Screen title="Entrega" back>
        <ErrorState mensagem={erro ?? 'Entrega não encontrada.'} onRetry={recarregar} />
      </Screen>
    );
  }

  const ponto = pontoPorId(entrega.pontoId);
  const podeAlterar = entrega.status === 'AGENDADA';

  return (
    <Screen
      title={`Entrega #${entrega.id}`}
      subtitle={formatarDataCurta(entrega.dataPrevista)}
      back
    >
      {sucesso && <Banner tipo="sucesso" mensagem={sucesso} />}
      {erroAcao && <Banner tipo="erro" mensagem={erroAcao} />}

      <Card style={styles.card}>
        <AppText variant="subtitle">Status</AppText>
        <AppText variant="bodyStrong" color={colors.primaryDark}>
          Data prevista: {formatarDataCurta(entrega.dataPrevista)}
        </AppText>
        <LinhaDoTempo status={entrega.status} />
        {entrega.status === 'RECUSADA' && entrega.motivoRecusa && (
          <Banner
            tipo="erro"
            mensagem={`Motivo: ${MOTIVOS_RECUSA[entrega.motivoRecusa]}${
              entrega.observacao ? ` — ${entrega.observacao}` : ''
            }`}
          />
        )}
        {entrega.status === 'CONCLUIDA' && (
          <Banner
            tipo="sucesso"
            mensagem="Entrega concluída! Seus pontos são calculados pela gamificação."
          />
        )}
      </Card>

      <Card style={styles.card}>
        <AppText variant="subtitle">Materiais</AppText>
        <ItensEntrega itens={entrega.itens} />
      </Card>

      {ponto && (
        <PontoCard
          ponto={ponto}
          acoes={
            <Button
              title="Como chegar"
              icon="navigate-outline"
              variant="outline"
              compact
              style={styles.flex}
              onPress={() => abrirNoMapa(ponto)}
            />
          }
        />
      )}

      <AppText variant="caption" color={colors.textMuted}>
        Pedido feito em {formatarData(entrega.criadoEm)}
      </AppText>

      {podeAlterar && (
        <View style={styles.acoes}>
          <Button
            title="Reagendar"
            icon="calendar-outline"
            variant="outline"
            onPress={() => {
              setNovaData(entrega.dataPrevista);
              setReagendando(true);
            }}
          />
          <Button
            title="Cancelar agendamento"
            icon="trash-outline"
            variant="ghost"
            loading={processando === 'excluir'}
            onPress={handleExcluir}
          />
        </View>
      )}

      <BottomSheet
        visivel={reagendando}
        titulo="Escolha a nova data"
        onFechar={() => setReagendando(false)}
      >
        <SeletorData valor={novaData} onChange={setNovaData} />
        {erroAcao && <Banner tipo="erro" mensagem={erroAcao} />}
        <Button
          title="Salvar nova data"
          icon="checkmark"
          disabled={!novaData || novaData === entrega.dataPrevista}
          loading={processando === 'reagendar'}
          onPress={handleReagendar}
        />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  acoes: {
    gap: spacing.sm,
  },
});
