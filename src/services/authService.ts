import { api } from './api';
import type { CadastroUsuarioRequest, LoginRequest, LoginResponse, Usuario } from '@/types/api';

export const authService = {
  /** POST /api/auth/login */
  async login(dados: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/api/auth/login', {
      email: dados.email.trim().toLowerCase(),
      senha: dados.senha,
    });
    return data;
  },

  /** POST /api/usuarios/cadastro (cadastro público: somente CIDADAO) */
  async cadastrar(dados: CadastroUsuarioRequest): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/api/usuarios/cadastro', {
      ...dados,
      nome: dados.nome.trim(),
      email: dados.email.trim().toLowerCase(),
      bairro: dados.bairro?.trim() || undefined,
    });
    return data;
  },

  /** GET /api/usuarios/{id} */
  async buscarUsuario(id: number): Promise<Usuario> {
    const { data } = await api.get<Usuario>(`/api/usuarios/${id}`);
    return data;
  },
};

/** Lê o campo "exp" do JWT (em ms). Retorna null se o token for inválido. */
export function expiracaoDoToken(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(globalThis.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}
