import { AxiosError, create, isAxiosError, type AxiosInstance } from 'axios';

import { env } from '@/config/env';
import type { ApiErrorBody } from '@/types/api';

/**
 * Token em memória: lido do SecureStore no início da sessão (AuthContext)
 * e anexado em todas as requisições autenticadas.
 */
let tokenAtual: string | null = null;
let aoExpirarSessao: (() => void) | null = null;

export function definirToken(token: string | null) {
  tokenAtual = token;
}

/** O AuthContext registra aqui o que fazer quando a API responder 401. */
export function registrarAoExpirarSessao(callback: (() => void) | null) {
  aoExpirarSessao = callback;
}

function criarCliente(baseURL: string): AxiosInstance {
  const cliente = create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  cliente.interceptors.request.use((config) => {
    if (tokenAtual) {
      config.headers.Authorization = `Bearer ${tokenAtual}`;
    }
    return config;
  });

  cliente.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const rotaDeLogin = error.config?.url?.includes('/api/auth/login');
      if (error.response?.status === 401 && tokenAtual && !rotaDeLogin) {
        aoExpirarSessao?.();
      }
      return Promise.reject(error);
    },
  );

  return cliente;
}

/** Cliente da API Java (backend principal). */
export const api = criarCliente(env.apiUrl);

/** Cliente da API .NET de gamificação (mesmo JWT emitido pelo Java). */
export const gamificacaoApi = criarCliente(env.gamificacaoUrl || env.apiUrl);

/** Cliente do serviço de identificação por imagem. */
export const iaApi = criarCliente(env.iaUrl);

/** Converte qualquer erro em uma mensagem clara para o usuário. */
export function mensagemDeErro(
  erro: unknown,
  padrao = 'Algo deu errado. Tente novamente.',
): string {
  if (isAxiosError(erro)) {
    const corpo = erro.response?.data as Partial<ApiErrorBody> | undefined;
    if (corpo?.mensagem) return corpo.mensagem;

    if (erro.code === 'ECONNABORTED') {
      return 'O servidor demorou para responder. Verifique sua conexão.';
    }
    if (!erro.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua internet.';
    }
    switch (erro.response.status) {
      case 401:
        return 'Sua sessão expirou. Entre novamente.';
      case 403:
        return 'Você não tem permissão para esta ação.';
      case 404:
        return 'Não encontramos o que você procurou.';
      case 409:
        return 'Esta ação não é permitida no estado atual.';
      default:
        if (erro.response.status >= 500) return 'Erro no servidor. Tente em instantes.';
    }
  }
  if (erro instanceof Error && erro.message) return erro.message;
  return padrao;
}

/** Tamanho de página usado nas listagens (Spring Pageable). */
export const TAMANHO_PAGINA = 100;
