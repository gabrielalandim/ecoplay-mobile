import { Text, type TextProps } from 'react-native';

import { colors, typography } from '@/theme';
import type { TypographyVariant } from '@/theme/typography';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

/** Texto padrão do app: aplica a escala tipográfica e as fontes do tema. */
export function AppText({
  variant = 'body',
  color = colors.text,
  align,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.4}
      style={[typography[variant], { color, textAlign: align }, style]}
      {...props}
    />
  );
}
