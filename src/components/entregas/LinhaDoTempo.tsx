import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { STATUS_ENTREGA } from '@/constants/domain';
import { colors, radius, spacing } from '@/theme';
import type { StatusEntrega } from '@/types/api';

const FLUXO: StatusEntrega[] = ['AGENDADA', 'CONFIRMADA', 'CONCLUIDA'];

/** Mostra em que etapa a entrega está: agendada → confirmada → concluída (ou recusada). */
export function LinhaDoTempo({ status }: { status: StatusEntrega }) {
  const etapas: StatusEntrega[] = status === 'RECUSADA' ? ['AGENDADA', 'RECUSADA'] : FLUXO;
  const indiceAtual = etapas.indexOf(status);

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Status atual: ${STATUS_ENTREGA[status].label}`}
    >
      {etapas.map((etapa, indice) => {
        const info = STATUS_ENTREGA[etapa];
        const feito = indice <= indiceAtual;
        const cor = feito ? info.cor : colors.border;
        return (
          <View key={etapa} style={styles.etapa}>
            <View style={styles.marcadorColuna}>
              <View
                style={[
                  styles.marcador,
                  { backgroundColor: feito ? info.fundo : colors.surface, borderColor: cor },
                ]}
              >
                <Ionicons name={info.icone} size={16} color={cor} />
              </View>
              {indice < etapas.length - 1 && (
                <View
                  style={[
                    styles.linha,
                    { backgroundColor: indice < indiceAtual ? cor : colors.border },
                  ]}
                />
              )}
            </View>
            <AppText
              variant={indice === indiceAtual ? 'bodyStrong' : 'body'}
              color={feito ? colors.text : colors.textMuted}
              style={styles.rotulo}
            >
              {info.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  etapa: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  marcadorColuna: {
    alignItems: 'center',
  },
  marcador: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linha: {
    width: 2,
    height: 20,
  },
  rotulo: {
    paddingTop: 4,
  },
});
