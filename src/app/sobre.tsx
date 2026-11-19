import { Platform, StyleSheet, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { AppText, Card, Screen } from '@/components/ui';
import { env } from '@/config/env';
import { colors, spacing } from '@/theme';

const EQUIPE = [
  { nome: 'Maria Gabriela Landim Severo', rm: '565146', area: 'Mobile' },
  { nome: 'Camily Vitoria Pereira Maciel', rm: '566520', area: 'Java' },
  { nome: 'Lucas Nunes Soares', rm: '566503', area: 'IA e .NET' },
  { nome: 'Samara Porto Souza', rm: '559072', area: 'Banco de dados' },
  { nome: 'Eduarda Weiss Ventura', rm: '564434', area: 'DevOps e QA' },
];

function LinhaInfo({
  rotulo,
  valor,
  mono = false,
}: {
  rotulo: string;
  valor: string;
  mono?: boolean;
}) {
  return (
    <View style={styles.linhaInfo}>
      <AppText variant="caption" color={colors.textMuted}>
        {rotulo}
      </AppText>
      <AppText
        variant="captionStrong"
        selectable
        style={mono ? styles.mono : undefined}
        numberOfLines={mono ? 2 : 1}
      >
        {valor}
      </AppText>
    </View>
  );
}

export default function SobreScreen() {
  return (
    <Screen title="Sobre o App" back>
      <Card style={styles.cardLogo}>
        <Logo tamanho={56} />
        <AppText variant="body" color={colors.textMuted}>
          Aplicativo que ensina a separar o lixo, mostra onde levar cada resíduo e conecta quem
          separa às cooperativas de catadores.
        </AppText>
      </Card>

      <Card style={styles.card}>
        <AppText variant="subtitle">Versão publicada</AppText>
        <LinhaInfo rotulo="Versão" valor={env.appVersion} />
        <LinhaInfo rotulo="Plataforma" valor={Platform.OS} />
        <LinhaInfo rotulo="Hash do commit" valor={env.commitHash} mono />
        <LinhaInfo rotulo="Commit (curto)" valor={env.commitHash.slice(0, 7)} mono />
        {env.buildDate && (
          <LinhaInfo rotulo="Build" valor={new Date(env.buildDate).toLocaleString('pt-BR')} />
        )}
        <AppText variant="caption" color={colors.textMuted}>
          Toque e segure o hash para copiá-lo.
        </AppText>
      </Card>

      <Card style={styles.card}>
        <AppText variant="subtitle">Equipe</AppText>
        {EQUIPE.map((integrante) => (
          <View key={integrante.rm} style={styles.integrante}>
            <AppText variant="bodyStrong">{integrante.nome}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              RM {integrante.rm} · {integrante.area}
            </AppText>
          </View>
        ))}
      </Card>

      <AppText variant="caption" color={colors.textMuted} align="center">
        Global Solution 2026/2 · CitizenTech · FIAP 2TDS
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardLogo: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
  linhaInfo: {
    gap: 2,
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  integrante: {
    gap: 2,
  },
});
