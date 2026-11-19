import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { useRecurso } from '@/hooks/useRecurso';
import { mensagemDeErro } from '@/services/api';
import { entregaService } from '@/services/entregaService';
import { colors, radius, spacing, TOUCH_MIN } from '@/theme';
import type { Entrega, MotivoRecusa } from '@/types/api';
import { pedirConfirmacao } from '@/utils/dialog';
import { formatarDataCurta } from '@/utils/format';

type Acao = 'confirmar' | 'recusar' | 'concluir';

export default function DetalheEntregaRecebidaScreen() {
  const usuario = useUsuarioLogado();
  const { pontoPorId } = useCatalogo();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entregaId = Number(id);

  // A API não tem GET por id para cooperativa: buscamos a lista e filtramos.
  const buscar = useCallback(async () => {
    const entregas = await entregaService.listarDaCooperativa(usuario.id);
    const entrega = entregas.find((e) => e.id === entregaId);
    if (!entrega) throw new Error('Entrega não encontrada para esta cooperativa.');
    return entrega;
  }, [entregaId, usuario.id]);

  const { dados: entrega, carregando, erro, recarregar, setDados } = useRecurso(buscar);

  const [processando, setProcessando] = useState<Acao | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [recusando, setRecusando] = useState(false);
  const [motivo, setMotivo] = useState<MotivoRecusa | null>(null);
  const [observacao, setObservacao] = useState('');

  async function executar(acao: Acao, chamada: () => Promise<Entrega>, mensagem: string) {
    setProcessando(acao);
    setErroAcao(null);
    setSucesso(null);
    try {
      const atualizada = await chamada();
      setDados(atualizada);
      setSucesso(mensagem);
      return true;
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
      return false;
    } finally {
      setProcessando(null);
    }
  }

  async function handleConfirmar() {
    if (!entrega) return;
    await executar(
      'confirmar',
      () => entregaService.confirmar(entrega.id, usuario.id),
      'Entrega confirmada. O cidadão já pode trazer os materiais.',
    );
  }

  async function handleConcluir() {
    if (!entrega) return;
    const ok = await pedirConfirmacao({
      titulo: 'Concluir entrega?',
      mensagem:
        'Confirme que os materiais foram recebidos e conferidos. Isso gera os pontos do cidadão.',
      textoConfirmar: 'Concluir',
    });
    if (!ok) return;
    await executar(
      'concluir',
      () => entregaService.concluir(entrega.id, usuario.id),
      'Entrega concluída! Os pontos do cidadão serão calculados.',
    );
  }

  async function handleRecusar() {
    if (!entrega || !motivo) return;
    const ok = await executar(
      'recusar',
      () => entregaService.recusar(entrega.id, usuario.id, motivo, observacao),
      'Entrega recusada. O cidadão verá o motivo informado.',
    );
    if (ok) {
      setRecusando(false);
      setMotivo(null);
      setObservacao('');
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
  const podeConfirmar = entrega.status === 'AGENDADA';
  const podeConcluir = entrega.status === 'CONFIRMADA';
  const podeRecusar = podeConfirmar || podeConcluir;

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
          onPress={handleConfirmar}
        />
      )}
      {podeConcluir && (
        <Button
          title="Concluir entrega"
          icon="trophy-outline"
          variant="accent"
          loading={processando === 'concluir'}
          onPress={handleConcluir}
        />
      )}
      {podeRecusar && (
        <Button
          title="Recusar entrega"
          icon="close-circle-outline"
          variant="outline"
          onPress={() => {
            setErroAcao(null);
            setRecusando(true);
          }}
        />
      )}

      <BottomSheet
        visivel={recusando}
        titulo="Por que recusar?"
        onFechar={() => setRecusando(false)}
      >
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
          onPress={handleRecusar}
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
