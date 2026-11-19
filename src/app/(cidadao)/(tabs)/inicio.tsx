import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AtalhoCard } from '@/components/AtalhoCard';
import { EntregaCard } from '@/components/entregas/EntregaCard';
import { NivelCard } from '@/components/gamificacao/NivelCard';
import { AppText, Banner, Card, LoadingState, Screen } from '@/components/ui';
import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useRecurso } from '@/hooks/useRecurso';
import { entregaService } from '@/services/entregaService';
import { gamificacaoService } from '@/services/gamificacaoService';
import { colors, radius, spacing } from '@/theme';
import {
  ehHojeOuFuturo,
  formatarPeso,
  primeiroNome,
  saudacaoPorHorario,
  somarPesos,
} from '@/utils/format';

export default function InicioScreen() {
  const router = useRouter();
  const usuario = useUsuarioLogado();

  const buscar = useCallback(async () => {
    const [entregas, resumo] = await Promise.all([
      entregaService.listarDoCidadao(usuario.id),
      gamificacaoService.buscarResumo(usuario.id).catch(() => null),
    ]);
    return { entregas, resumo };
  }, [usuario.id]);

  const { dados, carregando, atualizando, erro, atualizar } = useRecurso(buscar);

  const entregas = dados?.entregas ?? [];
  const proxima = entregas
    .filter(
      (e) =>
        (e.status === 'AGENDADA' || e.status === 'CONFIRMADA') && ehHojeOuFuturo(e.dataPrevista),
    )
    .sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista))[0];
  const kgEntregues = somarPesos(
    entregas.filter((e) => e.status === 'CONCLUIDA').flatMap((e) => e.itens),
  );

  return (
    <Screen refreshing={atualizando} onRefresh={atualizar}>
      <View style={styles.cabecalho}>
        <View style={styles.flex}>
          <AppText variant="title">
            {saudacaoPorHorario()}, {primeiroNome(usuario.nome)}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {usuario.bairro ? `${usuario.bairro} · ` : ''}Bora separar hoje?
          </AppText>
        </View>
        <View style={styles.kg} accessibilityLabel={`${formatarPeso(kgEntregues)} entregues`}>
          <AppText variant="subtitle" color={colors.primaryDark}>
            {formatarPeso(kgEntregues)}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            entregues
          </AppText>
        </View>
      </View>

      {carregando && !dados ? (
        <LoadingState />
      ) : (
        <>
          {erro && <Banner tipo="erro" mensagem={erro} />}
          {dados?.resumo && (
            <NivelCard resumo={dados.resumo} demonstracao={dados.resumo.origem === 'local'} />
          )}
        </>
      )}

      <Pressable
        onPress={() => router.push('/identificar')}
        style={({ pressed }) => [styles.botaoIdentificar, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Identificar resíduo com a câmera"
      >
        <View style={styles.iconeCamera}>
          <Ionicons name="camera" size={26} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="subtitle" color={colors.textOnPrimary}>
            Identificar resíduo
          </AppText>
          <AppText variant="caption" color="#D7EBDF">
            Tire uma foto e descubra como descartar
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textOnPrimary} />
      </Pressable>

      <View style={styles.grade}>
        <AtalhoCard
          titulo="Onde descartar"
          descricao="Pilha, óleo, vidro..."
          icone="location-outline"
          onPress={() => router.push('/pontos')}
        />
        <AtalhoCard
          titulo="Agendar entrega"
          descricao="Leve seus recicláveis"
          icone="calendar-outline"
          onPress={() => router.push('/entrega/nova')}
        />
        <AtalhoCard
          titulo="Materiais"
          descricao="Como preparar cada um"
          icone="file-tray-stacked-outline"
          onPress={() => router.push('/materiais')}
        />
        <AtalhoCard
          titulo="Desafios"
          descricao="Quiz e missões"
          icone="trophy-outline"
          onPress={() => router.push('/desafios')}
        />
      </View>

      <View style={styles.secao}>
        <View style={styles.tituloSecao}>
          <AppText variant="subtitle">Próxima entrega</AppText>
          <Pressable onPress={() => router.push('/entregas')} hitSlop={12} accessibilityRole="link">
            <AppText variant="captionStrong" color={colors.primary}>
              Ver histórico
            </AppText>
          </Pressable>
        </View>
        {proxima ? (
          <EntregaCard entrega={proxima} onPress={() => router.push(`/entrega/${proxima.id}`)} />
        ) : (
          !carregando && (
            <Card>
              <AppText variant="body" color={colors.textMuted}>
                Nenhuma entrega agendada. Que tal levar seus recicláveis a uma cooperativa?
              </AppText>
            </Card>
          )
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  kg: {
    alignItems: 'flex-end',
  },
  botaoIdentificar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  iconeCamera: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  secao: {
    gap: spacing.md,
  },
  tituloSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
