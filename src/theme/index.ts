import { colors } from './colors';
import { typography, fonts } from './typography';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Área mínima de toque recomendada pelas guidelines Android/iOS. */
export const TOUCH_MIN = 48;

export const shadow = {
  card: {
    shadowColor: '#0F4D2F',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;

export { colors, typography, fonts };
