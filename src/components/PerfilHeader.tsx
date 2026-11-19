import { StyleSheet, View } from 'react-native';

import { AppText } from './ui';
import { colors, radius, spacing } from '@/theme';
import type { Usuario } from '@/types/api';

/** Avatar com a inicial do nome + dados básicos do usuário logado. */
export function PerfilHeader({ usuario }: { usuario: Usuario }) {
  const inicial = usuario.nome.trim().charAt(0).toUpperCase();
  return (
    <View style={styles.container}>
      <View style={styles.avatar} accessibilityElementsHidden>
        <AppText variant="title" color={colors.primaryDark}>
          {inicial}
        </AppText>
      </View>
      <View style={styles.flex}>
        <AppText variant="subtitle">{usuario.nome}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {usuario.email}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {usuario.role === 'COOPERATIVA' ? 'Cooperativa' : 'Cidadão'}
          {usuario.bairro ? ` · ${usuario.bairro}` : ''}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
    gap: 2,
  },
});
