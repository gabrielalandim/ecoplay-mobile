import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
  Screen,
} from '@/components/ui';
import { useQuiz } from '@/hooks/useQuiz';
import { colors, radius, spacing, TOUCH_MIN } from '@/theme';

/** Quiz diário: perguntas e conferência das respostas pela API .NET de gamificação. */
export default function QuizScreen() {
  const router = useRouter();
  const quiz = useQuiz();

  if (quiz.carregando && !quiz.pergunta && !quiz.terminou) {
    return (
      <Screen title="Quiz do dia" back>
        <LoadingState mensagem="Buscando as perguntas..." />
      </Screen>
    );
  }
  if (quiz.erro) {
    return (
      <Screen title="Quiz do dia" back>
        <ErrorState mensagem={quiz.erro} onRetry={quiz.recarregar} />
      </Screen>
    );
  }
  if (quiz.total === 0) {
    return (
      <Screen title="Quiz do dia" back>
        <EmptyState icone="help-circle-outline" titulo="Nenhuma pergunta disponível hoje" />
      </Screen>
    );
  }

  if (quiz.terminou) {
    return (
      <Screen title="Quiz do dia" back>
        <Card style={styles.resultado}>
          <View style={styles.trofeu}>
            <Ionicons name="trophy" size={40} color={colors.primaryDark} />
          </View>
          <AppText variant="title" align="center">
            {quiz.acertos} de {quiz.total} acertos
          </AppText>
          <AppText variant="body" color={colors.textMuted} align="center">
            Você ganhou {quiz.xpGanho} XP nesta rodada. O limite é de 50 XP por dia.
          </AppText>
        </Card>
        <Button
          title="Ver meu progresso"
          icon="person-outline"
          onPress={() => router.replace('/perfil')}
        />
        <Button title="Jogar de novo" variant="outline" icon="refresh" onPress={quiz.recomecar} />
      </Screen>
    );
  }

  const { pergunta, resposta, escolhida } = quiz;
  if (!pergunta) return null;

  return (
    <Screen
      title="Quiz do dia"
      subtitle={`Pergunta ${quiz.numero} de ${quiz.total} · ${quiz.xpGanho} XP ganhos`}
      back
      footer={
        resposta ? (
          <Button
            title={quiz.numero === quiz.total ? 'Ver resultado' : 'Próxima pergunta'}
            icon="arrow-forward"
            onPress={quiz.proxima}
          />
        ) : undefined
      }
    >
      <ProgressBar
        progresso={(quiz.numero - 1) / quiz.total}
        cor={colors.primary}
        fundo={colors.border}
        altura={8}
      />

      <Card style={styles.pergunta}>
        <AppText variant="label" color={colors.textMuted}>
          {pergunta.categoria}
        </AppText>
        <AppText variant="subtitle">{pergunta.enunciado}</AppText>
      </Card>

      <View style={styles.alternativas}>
        {pergunta.alternativas.map((texto, i) => {
          const marcada = escolhida === i;
          const certa = marcada && resposta?.correta;
          const errada = marcada && resposta && !resposta.correta;
          return (
            <Pressable
              key={texto}
              onPress={() => quiz.responder(i)}
              disabled={!!resposta || quiz.enviando}
              accessibilityRole="radio"
              accessibilityState={{ selected: marcada, disabled: !!resposta }}
              accessibilityLabel={texto}
              style={[
                styles.alternativa,
                marcada && styles.marcada,
                certa && styles.certa,
                errada && styles.errada,
              ]}
            >
              <Ionicons
                name={
                  certa
                    ? 'checkmark-circle'
                    : errada
                      ? 'close-circle'
                      : marcada
                        ? 'radio-button-on'
                        : 'radio-button-off'
                }
                size={22}
                color={certa ? colors.primary : errada ? colors.danger : colors.textMuted}
              />
              <AppText variant="body" style={styles.flex}>
                {texto}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {quiz.erroResposta && <Banner tipo="erro" mensagem={quiz.erroResposta} />}
      {resposta && (
        <Banner
          tipo={resposta.correta ? 'sucesso' : 'aviso'}
          mensagem={
            resposta.xpConcedido > 0
              ? `${resposta.mensagem} +${resposta.xpConcedido} XP`
              : resposta.mensagem
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pergunta: {
    gap: spacing.sm,
  },
  alternativas: {
    gap: spacing.sm,
  },
  alternativa: {
    minHeight: TOUCH_MIN + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  marcada: {
    borderColor: colors.textMuted,
  },
  certa: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  errada: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  flex: {
    flex: 1,
  },
  resultado: {
    gap: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  trofeu: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
