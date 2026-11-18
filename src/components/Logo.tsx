import { Image, StyleSheet, View } from 'react-native';

import { AppText } from './ui/AppText';
import { colors, spacing } from '@/theme';

interface LogoProps {
  tamanho?: number;
  variante?: 'verde' | 'branco';
  comNome?: boolean;
}

/** Logo do EcoPlay: folha com um "play" — eco + jogo. */
export function Logo({ tamanho = 56, variante = 'verde', comNome = true }: LogoProps) {
  const fonte =
    variante === 'verde'
      ? require('../../assets/images/logo.png')
      : require('../../assets/images/logo-white.png');

  return (
    <View style={styles.linha} accessibilityRole="image" accessibilityLabel="EcoPlay">
      <Image source={fonte} style={{ width: tamanho, height: tamanho }} resizeMode="contain" />
      {comNome && (
        <AppText
          variant="display"
          color={variante === 'verde' ? colors.primaryDark : colors.textOnPrimary}
        >
          EcoPlay
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
