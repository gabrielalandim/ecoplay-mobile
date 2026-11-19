import { gamificacaoApi } from './api';
import { entregaService } from './entregaService';
import { identificacaoService } from './identificacaoService';
import { materialService } from './materialService';
import { usaGamificacaoReal } from '@/config/env';
import type { Recompensa, ResumoGamificacao } from '@/types/gamificacao';
import { calcularResumoLocal } from '@/utils/gamificacaoLocal';

/**
 * Integração com a API .NET de gamificação.
 * Enquanto EXPO_PUBLIC_GAMIFICACAO_URL não estiver configurada, pontos, nível e
 * conquistas são calculados no app a partir das entregas e identificações reais
 * da API Java (ver utils/gamificacaoLocal.ts). A vitrine de recompensas segue
 * como demonstração até a API .NET estar disponível.
 *
 * Contrato esperado (ver README):
 *   GET  /api/gamificacao/usuarios/{usuarioId}/resumo
 *   GET  /api/gamificacao/recompensas
 *   POST /api/gamificacao/recompensas/{id}/resgatar
 */

const RECOMPENSAS_DEMO: Recompensa[] = [
  {
    id: 1,
    titulo: 'Muda de árvore nativa',
    descricao: 'Retire uma muda no viveiro municipal parceiro.',
    custoPontos: 200,
    parceiro: 'Viveiro Municipal',
    disponivel: true,
  },
  {
    id: 2,
    titulo: '10% na feira orgânica',
    descricao: 'Cupom de desconto válido aos sábados.',
    custoPontos: 350,
    parceiro: 'Feira do Produtor',
    disponivel: true,
  },
  {
    id: 3,
    titulo: 'Ecobag EcoPlay',
    descricao: 'Sacola reutilizável feita com material reciclado.',
    custoPontos: 500,
    parceiro: 'Cooperativas parceiras',
    disponivel: true,
  },
  {
    id: 4,
    titulo: 'Passe de ônibus',
    descricao: 'Crédito de uma viagem no transporte público.',
    custoPontos: 800,
    parceiro: 'Prefeitura',
    disponivel: false,
  },
];

export const gamificacaoService = {
  usaDadosReais: usaGamificacaoReal,

  async buscarResumo(usuarioId: number): Promise<ResumoGamificacao> {
    if (!usaGamificacaoReal) {
      const [entregas, identificacoes, materiais] = await Promise.all([
        entregaService.listarDoCidadao(usuarioId),
        identificacaoService.listarDoUsuario(usuarioId).catch(() => []),
        materialService.listar(),
      ]);
      const mapa = new Map(materiais.map((m) => [m.id, m]));
      return calcularResumoLocal(usuarioId, entregas, identificacoes, (id) => mapa.get(id));
    }
    const { data } = await gamificacaoApi.get<ResumoGamificacao>(
      `/api/gamificacao/usuarios/${usuarioId}/resumo`,
    );
    return data;
  },

  async listarRecompensas(): Promise<Recompensa[]> {
    if (!usaGamificacaoReal) return RECOMPENSAS_DEMO;
    const { data } = await gamificacaoApi.get<Recompensa[]>('/api/gamificacao/recompensas');
    return data;
  },

  async resgatar(recompensaId: number): Promise<void> {
    if (!usaGamificacaoReal) {
      throw new Error(
        'A loja de recompensas estará disponível quando a gamificação for integrada.',
      );
    }
    await gamificacaoApi.post(`/api/gamificacao/recompensas/${recompensaId}/resgatar`);
  },
};
