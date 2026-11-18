import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

interface BottomSheetProps {
  visivel: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
}

/** Painel inferior modal usado para ações com formulário (ex.: recusar entrega). */
export function BottomSheet({ visivel, titulo, onFechar, children }: BottomSheetProps) {
  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={styles.overlay}
          onPress={onFechar}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        />
        <View style={styles.sheet}>
          <View style={styles.alca} />
          <AppText variant="subtitle" accessibilityRole="header">
            {titulo}
          </AppText>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  alca: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
});
