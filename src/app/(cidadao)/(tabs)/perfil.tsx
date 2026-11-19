import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { ConquistaItem } from '@/components/gamificacao/ConquistaItem';
import { NivelCard } from '@/components/gamificacao/NivelCard';
import { MenuItem } from '@/components/MenuItem';
import { PerfilHeader } from '@/components/PerfilHeader';
import { AppText, Banner, Card, LoadingState, Screen } from '@/components/ui';
import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useRecurso } from '@/hooks/useRecurso';
import { useSair } from '@/hooks/useSair';
import { entregaService } from '@/services/entregaService';
import { gamificacaoService } from '@/services/gamificacaoService';
import { identificacaoService } from '@/services/identificacaoService';
import { colors, spacing } from '@/theme';
import { formatarPeso, somarPesos } from '@/utils/format';

function Estatistica({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={styles.estatistica}>
      <AppText variant="subtitle" color={colors.primaryDark}>
        {valor}
      </AppText>
      <AppText variant="caption" color={colors.textMuted} align="center">
        {rotulo}
      </AppText>
    </View>
  );
}

export default function PerfilScreen() {
  const router = useRouter();
  const usuario = useUsuarioLogado();
  const sair = useSair();

  const buscar = useCallback(async () => {
    const [resumo, entregas, identificacoes] = await Promise.all([
      gamificacaoService.buscarResumo(usuario.id),
      entregaService.listarDoCidadao(usuario.id),
      identificacaoService.listarDoUsuario(usuario.id).catch(() => []),
    ]);
    return { resumo, entregas, identificacoes };
  }, [usuario.id]);

  const { dados, carregando, atualizando, erro, atualizar } = useRecurso(buscar);

  const concluidas = dados?.entregas.filter((e) => e.status === 'CONCLUIDA') ?? [];
  const kg = somarPesos(concluidas.flatMap((e) => e.itens));

  return (
    <Screen title="Perfil" refreshing={atualizando} onRefresh={atualizar}>
      <PerfilHeader usuario={usuario} />

      {erro && <Banner tipo="erro" mensagem={erro} />}

      {carregando && !dados ? (
        <LoadingState />
      ) : (
        dados && (
          <>
            <NivelCard resumo={dados.resumo} demonstracao={!gamificacaoService.usaDadosReais} />

            <Card style={styles.estatisticas}>
              <Estatistica valor={String(concluidas.length)} rotulo="entregas concluídas" />
              <Estatistica valor={formatarPeso(kg)} rotulo="reciclados" />
              <Estatistica valor={String(dados.identificacoes.length)} rotulo="identificações" />
            </Card>

            <Card style={styles.card}>
              <AppText variant="subtitle">Conquistas</AppText>
              {dados.resumo.conquistas.map((conquista) => (
                <ConquistaItem key={conquista.id} conquista={conquista} />
              ))}
            </Card>
          </>
        )
      )}

      <Card style={styles.menu}>
        <MenuItem
          titulo="Recompensas"
          icone="gift-outline"
          onPress={() => router.push('/recompensas')}
        />
        <MenuItem
          titulo="Materiais recicláveis"
          icone="file-tray-stacked-outline"
          onPress={() => router.push('/materiais')}
        />
        <MenuItem
          titulo="Pontos de descarte"
          icone="location-outline"
          onPress={() => router.push('/pontos')}
        />
        <MenuItem
          titulo="Sobre o App"
          icone="information-circle-outline"
          onPress={() => router.push('/sobre')}
        />
        <MenuItem titulo="Sair" icone="log-out-outline" perigo onPress={sair} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  estatisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  estatistica: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  card: {
    gap: spacing.lg,
  },
  menu: {
    padding: 0,
    overflow: 'hidden',
  },
});
