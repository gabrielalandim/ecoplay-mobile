import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';
import { parseDataIso, proximosDias } from '@/utils/format';

const DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

interface SeletorDataProps {
  valor: string | null;
  onChange: (dataIso: string) => void;
  dias?: number;
}

/** Seleção rápida de data entre hoje e os próximos dias (sem datas passadas). */
export function SeletorData({ valor, onChange, dias = 21 }: SeletorDataProps) {
  const opcoes = proximosDias(dias);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.linha}
    >
      {opcoes.map((iso, indice) => {
        const data = parseDataIso(iso);
        const selecionado = iso === valor;
        const corTexto = selecionado ? colors.textOnPrimary : colors.text;
        const rotulo = indice === 0 ? 'HOJE' : DIAS[data.getDay()];
        return (
          <Pressable
            key={iso}
            onPress={() => onChange(iso)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selecionado }}
            accessibilityLabel={`${rotulo}, ${data.getDate()} de ${MESES[data.getMonth()]}`}
            style={[styles.dia, selecionado && styles.selecionado]}
          >
            <AppText variant="label" color={selecionado ? colors.accent : colors.textMuted}>
              {rotulo}
            </AppText>
            <AppText variant="subtitle" color={corTexto}>
              {data.getDate()}
            </AppText>
            <AppText
              variant="caption"
              color={selecionado ? colors.textOnPrimary : colors.textMuted}
            >
              {MESES[data.getMonth()]}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  linha: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },
  dia: {
    width: 64,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selecionado: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
