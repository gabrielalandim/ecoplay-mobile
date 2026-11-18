import type { TextStyle } from 'react-native';

/** Famílias carregadas a partir de assets/fonts (ver src/app/_layout.tsx). */
export const fonts = {
  headingMedium: 'Poppins-Medium',
  heading: 'Poppins-SemiBold',
  headingBold: 'Poppins-Bold',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
} as const;

export const fontFiles = {
  [fonts.headingMedium]: require('../../assets/fonts/Poppins-Medium.ttf'),
  [fonts.heading]: require('../../assets/fonts/Poppins-SemiBold.ttf'),
  [fonts.headingBold]: require('../../assets/fonts/Poppins-Bold.ttf'),
  [fonts.body]: require('../../assets/fonts/Inter-Regular.ttf'),
  [fonts.bodyMedium]: require('../../assets/fonts/Inter-Medium.ttf'),
  [fonts.bodySemiBold]: require('../../assets/fonts/Inter-SemiBold.ttf'),
  [fonts.bodyBold]: require('../../assets/fonts/Inter-Bold.ttf'),
};

/** Escala tipográfica. Texto nunca abaixo de 14sp (guideline do plano). */
export const typography = {
  display: { fontFamily: fonts.headingBold, fontSize: 30, lineHeight: 38 },
  title: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 32 },
  subtitle: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  captionStrong: { fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 20 },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  number: { fontFamily: fonts.headingBold, fontSize: 28, lineHeight: 34 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
