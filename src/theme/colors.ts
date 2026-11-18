/**
 * Paleta "Folha" (escolhida no plano da GS).
 * Todos os pares texto/fundo passam no contraste mínimo WCAG AA (4,5:1).
 */
export const colors = {
  primary: '#1E7A4C',
  primaryDark: '#0F4D2F',
  primarySoft: '#E3F1E8',
  accent: '#C6E84F',
  accentSoft: '#F1F9D6',
  background: '#F4F7F1',
  surface: '#FFFFFF',
  text: '#142019',
  textMuted: '#4F5D55',
  textOnPrimary: '#FFFFFF',
  border: '#DCE4DD',
  danger: '#B3261E',
  dangerSoft: '#FCE8E6',
  warning: '#8A5A00',
  warningSoft: '#FFF4D6',
  info: '#1E5AA8',
  infoSoft: '#E4EEFB',
  overlay: 'rgba(20, 32, 25, 0.5)',
} as const;

export type ColorName = keyof typeof colors;
