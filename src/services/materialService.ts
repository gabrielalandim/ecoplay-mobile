import { api, TAMANHO_PAGINA } from './api';
import type { Material, Page } from '@/types/api';

export const materialService = {
  /** GET /api/materiais (público) */
  async listar(): Promise<Material[]> {
    const { data } = await api.get<Page<Material>>('/api/materiais', {
      params: { size: TAMANHO_PAGINA, sort: 'nome,asc' },
    });
    return data.content;
  },

  /** GET /api/materiais/{id} */
  async buscarPorId(id: number): Promise<Material> {
    const { data } = await api.get<Material>(`/api/materiais/${id}`);
    return data;
  },
};
