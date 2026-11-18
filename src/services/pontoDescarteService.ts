import { api, TAMANHO_PAGINA } from './api';
import type { Page, PontoDescarte, PontoDescarteRequest } from '@/types/api';

const BASE = '/api/pontos-descarte';

export const pontoDescarteService = {
  /** GET /api/pontos-descarte (público) */
  async listar(): Promise<PontoDescarte[]> {
    const { data } = await api.get<Page<PontoDescarte>>(BASE, {
      params: { size: TAMANHO_PAGINA, sort: 'nome,asc' },
    });
    return data.content;
  },

  async buscarPorId(id: number): Promise<PontoDescarte> {
    const { data } = await api.get<PontoDescarte>(`${BASE}/${id}`);
    return data;
  },

  /** Pontos administrados pela cooperativa logada. */
  async listarDaCooperativa(cooperativaId: number): Promise<PontoDescarte[]> {
    const pontos = await this.listar();
    return pontos.filter((ponto) => ponto.cooperativaId === cooperativaId);
  },

  /** POST /api/pontos-descarte (COOPERATIVA) */
  async cadastrar(dados: PontoDescarteRequest): Promise<PontoDescarte> {
    const { data } = await api.post<PontoDescarte>(BASE, dados);
    return data;
  },

  /** PUT /api/pontos-descarte/{id} (COOPERATIVA dona do ponto) */
  async atualizar(id: number, dados: PontoDescarteRequest): Promise<PontoDescarte> {
    const { data } = await api.put<PontoDescarte>(`${BASE}/${id}`, dados);
    return data;
  },

  /** DELETE /api/pontos-descarte/{id} (COOPERATIVA dona do ponto) */
  async excluir(id: number): Promise<void> {
    await api.delete(`${BASE}/${id}`);
  },
};
