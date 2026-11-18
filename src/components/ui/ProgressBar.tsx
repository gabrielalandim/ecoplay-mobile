import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

interface ProgressBarProps {
  /** Valor entre 0 e 1. */
  progresso: number;
  cor?: string;
  fundo?: string;
  altura?: number;
}

export function ProgressBar({
  progresso,
  cor = colors.accent,
  fundo = 'rgba(255,255,255,0.25)',
  altura = 10,
}: ProgressBarProps) {
  const percentual = Math.min(1, Math.max(0, progresso)) * 100;
  return (
    <View
      style={[styles.trilho, { backgroundColor: fundo, height: altura }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percentual) }}
    >
      <View style={[styles.barra, { width: `${percentual}%`, backgroundColor: cor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  trilho: {
    width: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  barra: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
