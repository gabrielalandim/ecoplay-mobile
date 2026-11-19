import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ItensEntrega } from '@/components/entregas/ItensEntrega';
import { LinhaDoTempo } from '@/components/entregas/LinhaDoTempo';
import { PontoCard } from '@/components/pontos/PontoCard';
import {
  AppText,
  Banner,
  BottomSheet,
  Button,
  Card,
  ErrorState,
  LoadingState,
  Screen,
  TextField,
} from '@/components/ui';
import { MOTIVOS_RECUSA } from '@/constants/domain';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { useEntregaRecebida } from '@/hooks/useEntregaRecebida';
import { colors, radius, spacing, TOUCH_MIN } from '@/theme';
import type { MotivoRecusa } from '@/types/api';
import { formatarDataCurta } from '@/utils/format';

export default function DetalheEntregaRecebidaScreen() {
  const { pontoPorId } = useCatalogo();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    entrega,
    carregando,
    erro,
    recarregar,
    processando,
    erroAcao,
    sucesso,
    podeConfirmar,
    podeConcluir,
    podeRecusar,
    recusando,
    abrirRecusa,
    fecharRecusa,
    motivo,
    setMotivo,
    observacao,
    setObservacao,
    confirmar,
    concluir,
    recusar,
  } = useEntregaRecebida(Number(id));

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

  return (
    <Screen
      title={`Entrega #${entrega.id}`}
      subtitle={`${formatarDataCurta(entrega.dataPrevista)} · Cidadão #${entrega.cidadaoId}`}
      back
    >
      {sucesso && <Banner tipo="sucesso" mensagem={sucesso} />}
      {erroAcao && !recusando && <Banner tipo="erro" mensagem={erroAcao} />}

      <Card style={styles.card}>
        <AppText variant="subtitle">Status</AppText>
        <LinhaDoTempo status={entrega.status} />
        {entrega.status === 'RECUSADA' && entrega.motivoRecusa && (
          <Banner
            tipo="erro"
            mensagem={`Motivo da recusa: ${MOTIVOS_RECUSA[entrega.motivoRecusa]}${
              entrega.observacao ? ` — ${entrega.observacao}` : ''
            }`}
          />
        )}
      </Card>

      <Card style={styles.card}>
        <AppText variant="subtitle">Materiais declarados</AppText>
        <ItensEntrega itens={entrega.itens} />
      </Card>

      {ponto && <PontoCard ponto={ponto} />}

      {podeConfirmar && (
        <Button
          title="Confirmar recebimento"
          icon="checkmark-circle-outline"
          loading={processando === 'confirmar'}
          onPress={confirmar}
        />
      )}
      {podeConcluir && (
        <Button
          title="Concluir entrega"
          icon="trophy-outline"
          variant="accent"
          loading={processando === 'concluir'}
          onPress={concluir}
        />
      )}
      {podeRecusar && (
        <Button
          title="Recusar entrega"
          icon="close-circle-outline"
          variant="outline"
          onPress={abrirRecusa}
        />
      )}

      <BottomSheet visivel={recusando} titulo="Por que recusar?" onFechar={fecharRecusa}>
        <View style={styles.motivos}>
          {(Object.keys(MOTIVOS_RECUSA) as MotivoRecusa[]).map((m) => {
            const selecionado = motivo === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMotivo(m)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selecionado }}
                accessibilityLabel={MOTIVOS_RECUSA[m]}
                style={[styles.motivo, selecionado && styles.motivoSelecionado]}
              >
                <Ionicons
                  name={selecionado ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selecionado ? colors.danger : colors.textMuted}
                />
                <AppText variant="body">{MOTIVOS_RECUSA[m]}</AppText>
              </Pressable>
            );
          })}
        </View>
        <TextField
          label="Observação (opcional)"
          placeholder="Ex.: vidro misturado com resto de comida"
          value={observacao}
          onChangeText={setObservacao}
          multiline
        />
        {erroAcao && <Banner tipo="erro" mensagem={erroAcao} />}
        <Button
          title="Recusar entrega"
          variant="danger"
          disabled={!motivo}
          loading={processando === 'recusar'}
          onPress={recusar}
        />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  motivos: {
    gap: spacing.sm,
  },
  motivo: {
    minHeight: TOUCH_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  motivoSelecionado: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
});
