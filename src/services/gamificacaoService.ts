import { gamificacaoApi } from './api';
import { usaGamificacaoReal } from '@/config/env';
import type { Recompensa, ResumoGamificacao } from '@/types/gamificacao';

/**
 * Integração com a API .NET de gamificação.
 * Enquanto EXPO_PUBLIC_GAMIFICACAO_URL não estiver configurada, o app usa
 * dados de demonstração (sinalizados na interface).
 *
 * Contrato esperado (ver README):
 *   GET  /api/gamificacao/usuarios/{usuarioId}/resumo
 *   GET  /api/gamificacao/recompensas
 *   POST /api/gamificacao/recompensas/{id}/resgatar
 */

const RESUMO_DEMO: Omit<ResumoGamificacao, 'usuarioId'> = {
  pontos: 320,
  xp: 420,
  nivel: 'Muda',
  nivelNumero: 2,
  xpProximoNivel: 600,
  proximoNivel: 'Árvore',
  conquistas: [
    {
      id: 1,
      nome: 'Primeira entrega',
      descricao: 'Concluiu a primeira entrega em uma cooperativa.',
      conquistadaEm: '2026-11-10',
    },
    {
      id: 2,
      nome: 'Olho clínico',
      descricao: 'Identificou 5 resíduos com a câmera.',
      conquistadaEm: '2026-11-12',
    },
    {
      id: 3,
      nome: 'Guardião do vidro',
      descricao: 'Entregue 10 kg de vidro.',
      conquistadaEm: null,
    },
    {
      id: 4,
      nome: 'Mestre da separação',
      descricao: 'Tenha 5 entregas sem recusa seguidas.',
      conquistadaEm: null,
    },
  ],
};

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
    if (!usaGamificacaoReal) return { usuarioId, ...RESUMO_DEMO };
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
      throw new Error('A loja de recompensas estará disponível quando a gamificação for integrada.');
    }
    await gamificacaoApi.post(`/api/gamificacao/recompensas/${recompensaId}/resgatar`);
  },
};
