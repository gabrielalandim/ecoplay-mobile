import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/ui';
import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useRecurso } from '@/hooks/useRecurso';
import { mensagemDeErro } from '@/services/api';
import { gamificacaoService } from '@/services/gamificacaoService';
import { colors, radius, spacing } from '@/theme';
import type { Recompensa } from '@/types/gamificacao';

export default function RecompensasScreen() {
  const usuario = useUsuarioLogado();
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'aviso'; texto: string } | null>(
    null,
  );
  const [resgatando, setResgatando] = useState<number | null>(null);

  const buscar = useCallback(async () => {
    const [resumo, recompensas] = await Promise.all([
      gamificacaoService.buscarResumo(usuario.id),
      gamificacaoService.listarRecompensas(),
    ]);
    return { resumo, recompensas };
  }, [usuario.id]);

  const { dados, carregando, erro, recarregar } = useRecurso(buscar);

  async function handleResgatar(recompensa: Recompensa) {
    setResgatando(recompensa.id);
    setMensagem(null);
    try {
      await gamificacaoService.resgatar(recompensa.id);
      setMensagem({ tipo: 'sucesso', texto: `Você resgatou: ${recompensa.titulo}!` });
      await recarregar();
    } catch (e) {
      setMensagem({ tipo: 'aviso', texto: mensagemDeErro(e) });
    } finally {
      setResgatando(null);
    }
  }

  return (
    <Screen title="Recompensas" subtitle="Troque seus pontos por benefícios reais." back>
      {carregando && !dados ? (
        <LoadingState />
      ) : erro || !dados ? (
        <ErrorState mensagem={erro ?? 'Não foi possível carregar.'} onRetry={recarregar} />
      ) : (
        <>
          <View style={styles.saldo}>
            <Ionicons name="star" size={28} color={colors.primaryDark} />
            <View>
              <AppText variant="label" color={colors.primaryDark}>
                SEU SALDO
              </AppText>
              <AppText variant="number" color={colors.primaryDark}>
                {dados.resumo.pontos} pontos
              </AppText>
            </View>
          </View>

          {!gamificacaoService.usaDadosReais && (
            <Banner
              tipo="info"
              mensagem="Vitrine de demonstração. Os resgates serão liberados com a integração da API de gamificação."
            />
          )}
          {mensagem && <Banner tipo={mensagem.tipo} mensagem={mensagem.texto} />}

          {dados.recompensas.length === 0 ? (
            <EmptyState icone="gift-outline" titulo="Nenhuma recompensa disponível no momento" />
          ) : (
            dados.recompensas.map((recompensa) => {
              const faltam = recompensa.custoPontos - dados.resumo.pontos;
              const podeResgatar = recompensa.disponivel && faltam <= 0;
              return (
                <Card key={recompensa.id} style={styles.card}>
                  <View style={styles.linha}>
                    <View style={styles.icone}>
                      <Ionicons name="gift" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.flex}>
                      <AppText variant="bodyStrong">{recompensa.titulo}</AppText>
                      <AppText variant="caption" color={colors.textMuted}>
                        {recompensa.parceiro}
                      </AppText>
                    </View>
                    <AppText variant="bodyStrong" color={colors.primaryDark}>
                      {recompensa.custoPontos} pts
                    </AppText>
                  </View>
                  <AppText variant="body" color={colors.textMuted}>
                    {recompensa.descricao}
                  </AppText>
                  <Button
                    title={
                      !recompensa.disponivel
                        ? 'Esgotado'
                        : podeResgatar
                          ? 'Resgatar'
                          : `Faltam ${faltam} pontos`
                    }
                    variant={podeResgatar ? 'accent' : 'secondary'}
                    compact
                    disabled={!podeResgatar}
                    loading={resgatando === recompensa.id}
                    onPress={() => handleResgatar(recompensa)}
                  />
                </Card>
              );
            })
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  saldo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
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
  flex: {
    flex: 1,
  },
});
