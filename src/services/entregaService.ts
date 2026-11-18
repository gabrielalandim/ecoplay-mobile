import { api, TAMANHO_PAGINA } from './api';
import type { Entrega, EntregaRequest, MotivoRecusa, Page } from '@/types/api';

const BASE = '/api/entregas';

export const entregaService = {
  // ---------- Cidadão ----------

  /** POST /api/entregas?cidadaoId= */
  async agendar(cidadaoId: number, dados: EntregaRequest): Promise<Entrega> {
    const { data } = await api.post<Entrega>(BASE, dados, { params: { cidadaoId } });
    return data;
  },

  /** GET /api/entregas/cidadao/{cidadaoId} */
  async listarDoCidadao(cidadaoId: number): Promise<Entrega[]> {
    const { data } = await api.get<Page<Entrega>>(`${BASE}/cidadao/${cidadaoId}`, {
      params: { size: TAMANHO_PAGINA, sort: 'dataPrevista,desc' },
    });
    return data.content;
  },

  /** GET /api/entregas/{id}?cidadaoId= */
  async buscarDoCidadao(id: number, cidadaoId: number): Promise<Entrega> {
    const { data } = await api.get<Entrega>(`${BASE}/${id}`, { params: { cidadaoId } });
    return data;
  },

  /** PUT /api/entregas/{id}/reagendar?cidadaoId=&novaData= (somente AGENDADA) */
  async reagendar(id: number, cidadaoId: number, novaData: string): Promise<Entrega> {
    const { data } = await api.put<Entrega>(`${BASE}/${id}/reagendar`, null, {
      params: { cidadaoId, novaData },
    });
    return data;
  },

  /** DELETE /api/entregas/{id}?cidadaoId= (somente AGENDADA) */
  async excluir(id: number, cidadaoId: number): Promise<void> {
    await api.delete(`${BASE}/${id}`, { params: { cidadaoId } });
  },

  // ---------- Cooperativa ----------

  /** GET /api/entregas/cooperativa/{cooperativaId} */
  async listarDaCooperativa(cooperativaId: number): Promise<Entrega[]> {
    const { data } = await api.get<Page<Entrega>>(`${BASE}/cooperativa/${cooperativaId}`, {
      params: { size: TAMANHO_PAGINA, sort: 'dataPrevista,asc' },
    });
    return data.content;
  },

  /** PATCH /api/entregas/{id}/confirmar (AGENDADA -> CONFIRMADA) */
  async confirmar(id: number, cooperativaId: number): Promise<Entrega> {
    const { data } = await api.patch<Entrega>(`${BASE}/${id}/confirmar`, null, {
      params: { cooperativaId },
    });
    return data;
  },

  /** PATCH /api/entregas/{id}/recusar (AGENDADA|CONFIRMADA -> RECUSADA) */
  async recusar(
    id: number,
    cooperativaId: number,
    motivo: MotivoRecusa,
    observacao?: string,
  ): Promise<Entrega> {
    const { data } = await api.patch<Entrega>(`${BASE}/${id}/recusar`, null, {
      params: { cooperativaId, motivo, observacao: observacao?.trim() || undefined },
    });
    return data;
  },

  /** PATCH /api/entregas/{id}/concluir (CONFIRMADA -> CONCLUIDA) */
  async concluir(id: number, cooperativaId: number): Promise<Entrega> {
    const { data } = await api.patch<Entrega>(`${BASE}/${id}/concluir`, null, {
      params: { cooperativaId },
    });
    return data;
  },
};
