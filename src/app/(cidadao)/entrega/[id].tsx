import { useLocalSearchParams } from 'expo-router';
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
import { useCatalogo } from '@/contexts/CatalogoContext';
import { useEntregaDetalhe } from '@/hooks/useEntregaDetalhe';
import { colors, spacing } from '@/theme';
import { formatarData, formatarDataCurta } from '@/utils/format';

export default function DetalheEntregaScreen() {
  const { pontoPorId } = useCatalogo();
  const { id, criada } = useLocalSearchParams<{ id: string; criada?: string }>();
  const {
    entrega,
    carregando,
    erro,
    recarregar,
    reagendando,
    abrirReagendamento,
    fecharReagendamento,
    novaData,
    setNovaData,
    processando,
    erroAcao,
    sucesso,
    reagendar,
    excluir,
  } = useEntregaDetalhe(Number(id), !!criada);

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
            onPress={abrirReagendamento}
          />
          <Button
            title="Cancelar agendamento"
            icon="trash-outline"
            variant="ghost"
            loading={processando === 'excluir'}
            onPress={excluir}
          />
        </View>
      )}

      <BottomSheet
        visivel={reagendando}
        titulo="Escolha a nova data"
        onFechar={fecharReagendamento}
      >
        <SeletorData valor={novaData} onChange={setNovaData} />
        {erroAcao && <Banner tipo="erro" mensagem={erroAcao} />}
        <Button
          title="Salvar nova data"
          icon="checkmark"
          disabled={!novaData || novaData === entrega.dataPrevista}
          loading={processando === 'reagendar'}
          onPress={reagendar}
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
