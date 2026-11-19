import { Ionicons } from '@expo/vector-icons';
import { useCallback, type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
  Screen,
} from '@/components/ui';
import { useRecurso } from '@/hooks/useRecurso';
import { gamificacaoService } from '@/services/gamificacaoService';
import { colors, radius, spacing } from '@/theme';
import type { MissaoApi } from '@/types/gamificacao';

const ICONE_POR_TIPO: Record<string, ComponentProps<typeof Ionicons>['name']> = {
  ENTREGA: 'cube-outline',
  QUIZ: 'help-circle-outline',
  IDENTIFICACAO: 'camera-outline',
  REFORCO: 'refresh-outline',
};

function MissaoCard({ missao }: { missao: MissaoApi }) {
  const progresso = missao.meta > 0 ? missao.progresso / missao.meta : 0;
  return (
    <Card style={styles.card}>
      <View style={styles.linha}>
        <View style={[styles.icone, missao.concluida && styles.iconeConcluido]}>
          <Ionicons
            name={missao.concluida ? 'checkmark' : (ICONE_POR_TIPO[missao.tipo] ?? 'flag-outline')}
            size={22}
            color={colors.primaryDark}
          />
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyStrong">{missao.titulo}</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {missao.descricao}
          </AppText>
        </View>
        <AppText variant="captionStrong" color={colors.primaryDark}>
          +{missao.xp} XP
        </AppText>
      </View>
      <ProgressBar progresso={progresso} cor={colors.primary} fundo={colors.border} altura={8} />
      <AppText variant="caption" color={colors.textMuted}>
        {missao.concluida
          ? 'Missão concluída'
          : `${Math.min(missao.progresso, missao.meta)} de ${missao.meta}`}
      </AppText>
    </Card>
  );
}

/** Missões da API .NET de gamificação. */
export default function DesafiosScreen() {
  const buscar = useCallback(
    async () => (gamificacaoService.usaDadosReais ? gamificacaoService.listarMissoes() : []),
    [],
  );
  const {
    dados: missoes,
    carregando,
    atualizando,
    erro,
    recarregar,
    atualizar,
  } = useRecurso(buscar);

  if (!gamificacaoService.usaDadosReais) {
    return (
      <Screen title="Desafios" back>
        <EmptyState
          icone="trophy-outline"
          titulo="Gamificação não conectada"
          descricao="As missões chegam da API de gamificação. Configure EXPO_PUBLIC_GAMIFICACAO_URL para ativar."
        />
      </Screen>
    );
  }

  return (
    <Screen
      title="Desafios"
      subtitle="Complete missões para ganhar XP."
      back
      refreshing={atualizando}
      onRefresh={atualizar}
    >
      <AppText variant="subtitle">Missões</AppText>
      {carregando && !missoes ? (
        <LoadingState />
      ) : erro ? (
        <ErrorState mensagem={erro} onRetry={recarregar} />
      ) : !missoes || missoes.length === 0 ? (
        <EmptyState icone="flag-outline" titulo="Nenhuma missão disponível no momento" />
      ) : (
        missoes.map((missao) => <MissaoCard key={missao.id} missao={missao} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icone: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeConcluido: {
    backgroundColor: colors.accent,
  },
  flex: {
    flex: 1,
  },
});
