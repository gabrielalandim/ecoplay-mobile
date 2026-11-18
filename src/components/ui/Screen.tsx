import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { colors, spacing, TOUCH_MIN } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  /** Mostra o botão de voltar no cabeçalho. */
  back?: boolean;
  headerRight?: ReactNode;
  /** false para telas que usam FlatList própria. */
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: ReactNode;
}

/** Estrutura base das telas: área segura, cabeçalho, rolagem e teclado. */
export function Screen({
  children,
  title,
  subtitle,
  back = false,
  headerRight,
  scroll = true,
  refreshing = false,
  onRefresh,
  footer,
}: ScreenProps) {
  const router = useRouter();

  const cabecalho = (title || back) && (
    <View style={styles.header}>
      {back && (
        <Pressable
          onPress={() => router.back()}
          style={styles.botaoVoltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      )}
      <View style={styles.titulos}>
        {title && (
          <AppText variant="title" accessibilityRole="header" numberOfLines={2}>
            {title}
          </AppText>
        )}
        {subtitle && (
          <AppText variant="caption" color={colors.textMuted}>
            {subtitle}
          </AppText>
        )}
      </View>
      {headerRight}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.conteudo}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              ) : undefined
            }
          >
            {cabecalho}
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.semScroll]}>
            {cabecalho}
            {children}
          </View>
        )}
        {footer && <View style={styles.footer}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  conteudo: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.lg,
  },
  semScroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  botaoVoltar: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    marginLeft: -spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulos: {
    flex: 1,
    gap: 2,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
