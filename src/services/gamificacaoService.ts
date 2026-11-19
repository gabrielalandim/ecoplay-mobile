import { gamificacaoApi } from './api';
import { entregaService } from './entregaService';
import { identificacaoService } from './identificacaoService';
import { materialService } from './materialService';
import { usaGamificacaoReal } from '@/config/env';
import type {
  Conquista,
  MissaoApi,
  PerguntaQuiz,
  ProgressoApi,
  RespostaQuiz,
  ResumoGamificacao,
} from '@/types/gamificacao';
import { calcularResumoLocal } from '@/utils/gamificacaoLocal';

/**
 * Integração com a API .NET de gamificação (EXPO_PUBLIC_GAMIFICACAO_URL).
 *   GET  /api/progresso       XP, nível e medalhas do cidadão
 *   GET  /api/missoes         missões e progresso
 *   GET  /api/quiz/hoje       perguntas do quiz diário
 *   POST /api/quiz/respostas  confere a resposta e credita XP
 *
 * Sem a URL configurada (ou se a API estiver fora do ar), o resumo é calculado
 * no app a partir das entregas e identificações reais da API Java.
 */

/** Mesmas faixas de RegrasGamificacao.Nivel na API .NET. */
const NIVEIS_API = [
  { nome: 'Semente', xpMinimo: 0 },
  { nome: 'Broto', xpMinimo: 200 },
  { nome: 'Muda', xpMinimo: 600 },
  { nome: 'Árvore', xpMinimo: 1500 },
  { nome: 'Floresta', xpMinimo: 4000 },
];

/** Catálogo de medalhas da API .NET (tabela gamificacao.medalha). */
const MEDALHAS_API = [
  { id: 1, nome: 'Primeira Entrega', descricao: 'Concluir a primeira entrega.' },
  { id: 2, nome: '10 kg Entregues', descricao: 'Acumular 10 kg em entregas confirmadas.' },
  {
    id: 3,
    nome: 'Separação Perfeita',
    descricao: 'Concluir cinco entregas seguidas sem recusa.',
  },
  { id: 4, nome: 'Caçador de Pilhas', descricao: 'Entregar o primeiro resíduo especial.' },
  { id: 5, nome: 'Mestre do Quiz', descricao: 'Acertar dez perguntas seguidas.' },
];

function resumoDaApi(usuarioId: number, progresso: ProgressoApi): ResumoGamificacao {
  const xp = progresso.xpTotal;
  const indice = NIVEIS_API.reduce((atual, nivel, i) => (xp >= nivel.xpMinimo ? i : atual), 0);
  const proximo = NIVEIS_API[indice + 1];

  const conquistas: Conquista[] = MEDALHAS_API.map((medalha) => ({
    ...medalha,
    conquistada: progresso.medalhas.includes(medalha.nome),
    conquistadaEm: null,
  }));

  return {
    usuarioId,
    pontos: xp,
    xp,
    nivel: progresso.nivel,
    nivelNumero: indice + 1,
    xpProximoNivel: proximo?.xpMinimo ?? xp,
    proximoNivel: proximo?.nome ?? null,
    conquistas,
    origem: 'api',
  };
}

async function resumoLocal(usuarioId: number): Promise<ResumoGamificacao> {
  const [entregas, identificacoes, materiais] = await Promise.all([
    entregaService.listarDoCidadao(usuarioId),
    identificacaoService.listarDoUsuario(usuarioId).catch(() => []),
    materialService.listar(),
  ]);
  const mapa = new Map(materiais.map((m) => [m.id, m]));
  return calcularResumoLocal(usuarioId, entregas, identificacoes, (id) => mapa.get(id));
}

export const gamificacaoService = {
  usaDadosReais: usaGamificacaoReal,

  async buscarResumo(usuarioId: number): Promise<ResumoGamificacao> {
    if (!usaGamificacaoReal) return resumoLocal(usuarioId);
    try {
      const { data } = await gamificacaoApi.get<ProgressoApi>('/api/progresso');
      return resumoDaApi(usuarioId, data);
    } catch {
      return resumoLocal(usuarioId);
    }
  },

  async listarMissoes(): Promise<MissaoApi[]> {
    const { data } = await gamificacaoApi.get<MissaoApi[]>('/api/missoes');
    return data;
  },

  async quizDoDia(): Promise<PerguntaQuiz[]> {
    const { data } = await gamificacaoApi.get<PerguntaQuiz[]>('/api/quiz/hoje');
    return data;
  },

  async responderQuiz(perguntaId: number, indiceAlternativa: number): Promise<RespostaQuiz> {
    const { data } = await gamificacaoApi.post<RespostaQuiz>('/api/quiz/respostas', {
      perguntaId,
      indiceAlternativa,
    });
    return data;
  },
};
