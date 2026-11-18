import { api, TAMANHO_PAGINA } from './api';
import type { Identificacao, Page } from '@/types/api';

const BASE = '/api/identificacoes';

export const identificacaoService = {
  /** POST /api/identificacoes?usuarioId= — registra o resultado da IA no Oracle. */
  async registrar(
    usuarioId: number,
    materialId: number,
    confianca: number,
  ): Promise<Identificacao> {
    const { data } = await api.post<Identificacao>(
      BASE,
      { materialId, confianca: Math.min(1, Math.max(0, confianca)) },
      { params: { usuarioId } },
    );
    return data;
  },

  /** PATCH /api/identificacoes/{id}/confirmar?usuarioId= */
  async confirmar(id: number, usuarioId: number, confirmada: boolean): Promise<Identificacao> {
    const { data } = await api.patch<Identificacao>(
      `${BASE}/${id}/confirmar`,
      { confirmadaPeloUsuario: confirmada },
      { params: { usuarioId } },
    );
    return data;
  },

  /** GET /api/identificacoes/usuario/{usuarioId} */
  async listarDoUsuario(usuarioId: number): Promise<Identificacao[]> {
    const { data } = await api.get<Page<Identificacao>>(`${BASE}/usuario/${usuarioId}`, {
      params: { size: TAMANHO_PAGINA, sort: 'id,desc' },
    });
    return data.content;
  },
};
