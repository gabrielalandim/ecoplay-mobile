import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Armazenamento seguro da sessão.
 * - Android/iOS: expo-secure-store (Keystore / Keychain).
 * - Web (apenas para testes no navegador): localStorage.
 */
const CHAVE_TOKEN = 'ecoplay.token';
const CHAVE_USUARIO = 'ecoplay.usuario';

const isWeb = Platform.OS === 'web';

async function salvar(chave: string, valor: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(chave, valor);
    return;
  }
  await SecureStore.setItemAsync(chave, valor);
}

async function ler(chave: string): Promise<string | null> {
  if (isWeb) return globalThis.localStorage?.getItem(chave) ?? null;
  return SecureStore.getItemAsync(chave);
}

async function remover(chave: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(chave);
    return;
  }
  await SecureStore.deleteItemAsync(chave);
}

export const sessionStorage = {
  salvarSessao: async (token: string, usuarioJson: string) => {
    await salvar(CHAVE_TOKEN, token);
    await salvar(CHAVE_USUARIO, usuarioJson);
  },
  lerToken: () => ler(CHAVE_TOKEN),
  lerUsuario: () => ler(CHAVE_USUARIO),
  limparSessao: async () => {
    await remover(CHAVE_TOKEN);
    await remover(CHAVE_USUARIO);
  },
};
