import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import { colors, radius, spacing } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function LoadingState({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText variant="caption" color={colors.textMuted}>
        {mensagem}
      </AppText>
    </View>
  );
}

interface ErrorStateProps {
  mensagem: string;
  onRetry?: () => void;
}

export function ErrorState({ mensagem, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityLiveRegion="assertive">
      <View style={[styles.icone, { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
      </View>
      <AppText variant="subtitle" align="center">
        Ops, algo não saiu como esperado
      </AppText>
      <AppText variant="caption" color={colors.textMuted} align="center">
        {mensagem}
      </AppText>
      {onRetry && (
        <Button
          title="Tentar novamente"
          icon="refresh"
          variant="outline"
          compact
          onPress={onRetry}
        />
      )}
    </View>
  );
}

interface EmptyStateProps {
  icone: IconName;
  titulo: string;
  descricao?: string;
  acao?: { titulo: string; onPress: () => void };
}

export function EmptyState({ icone, titulo, descricao, acao }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.icone, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icone} size={32} color={colors.primary} />
      </View>
      <AppText variant="subtitle" align="center">
        {titulo}
      </AppText>
      {descricao && (
        <AppText variant="caption" color={colors.textMuted} align="center">
          {descricao}
        </AppText>
      )}
      {acao && <Button title={acao.titulo} compact onPress={acao.onPress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  icone: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
