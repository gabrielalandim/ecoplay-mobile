import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { MenuItem } from '@/components/MenuItem';
import { PerfilHeader } from '@/components/PerfilHeader';
import { AppText, Card, LoadingState, Screen } from '@/components/ui';
import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useRecurso } from '@/hooks/useRecurso';
import { useSair } from '@/hooks/useSair';
import { entregaService } from '@/services/entregaService';
import { colors, spacing } from '@/theme';
import { formatarPeso, somarPesos } from '@/utils/format';

export default function ContaCooperativaScreen() {
  const router = useRouter();
  const usuario = useUsuarioLogado();
  const sair = useSair();

  const buscar = useCallback(() => entregaService.listarDaCooperativa(usuario.id), [usuario.id]);
  const { dados, carregando } = useRecurso(buscar);

  const concluidas = (dados ?? []).filter((e) => e.status === 'CONCLUIDA');
  const recusadas = (dados ?? []).filter((e) => e.status === 'RECUSADA');
  const kg = somarPesos(concluidas.flatMap((e) => e.itens));

  return (
    <Screen title="Conta">
      <PerfilHeader usuario={usuario} />

      {carregando && !dados ? (
        <LoadingState />
      ) : (
        <Card style={styles.impacto}>
          <AppText variant="label" color={colors.accent}>
            IMPACTO DA COOPERATIVA
          </AppText>
          <AppText variant="display" color={colors.textOnPrimary}>
            {formatarPeso(kg)}
          </AppText>
          <AppText variant="caption" color="#D7EBDF">
            recebidos em {concluidas.length} entregas concluídas
          </AppText>
          <View style={styles.linha}>
            <AppText variant="caption" color="#D7EBDF">
              {recusadas.length} recusadas · {(dados ?? []).length} no total
            </AppText>
          </View>
        </Card>
      )}

      <Card style={styles.menu}>
        <MenuItem
          titulo="Gerenciar meus pontos"
          icone="location-outline"
          onPress={() => router.push('/meus-pontos')}
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
  impacto: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
    gap: spacing.xs,
    padding: spacing.xl,
  },
  linha: {
    marginTop: spacing.sm,
  },
  menu: {
    padding: 0,
    overflow: 'hidden',
  },
});
