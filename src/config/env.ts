import Constants from 'expo-constants';

/**
 * Configurações lidas das variáveis EXPO_PUBLIC_* (arquivo .env).
 * Ver .env.example para a explicação de cada uma.
 */
const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080').replace(/\/$/, '');

export const env = {
  apiUrl,
  iaUrl: (process.env.EXPO_PUBLIC_IA_URL || apiUrl).replace(/\/$/, ''),
  iaMock: process.env.EXPO_PUBLIC_IA_MOCK !== 'false',
  gamificacaoUrl: (process.env.EXPO_PUBLIC_GAMIFICACAO_URL ?? '').replace(/\/$/, ''),
  appVersion: Constants.expoConfig?.version ?? '1.0.0',
  commitHash: (Constants.expoConfig?.extra?.commitHash as string | undefined) ?? 'desconhecido',
  buildDate: (Constants.expoConfig?.extra?.buildDate as string | undefined) ?? null,
} as const;

export const usaGamificacaoReal = env.gamificacaoUrl.length > 0;
