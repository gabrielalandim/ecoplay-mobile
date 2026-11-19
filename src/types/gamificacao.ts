/**
 * Tipos da gamificação.
 * Os tipos "Api" espelham os DTOs da API .NET (Domain/Contracts.cs);
 * ResumoGamificacao é o formato que as telas usam, venha da API ou do cálculo local.
 */

export interface Conquista {
  id: number;
  nome: string;
  descricao: string;
  conquistada: boolean;
  /** Data em que foi conquistada, quando conhecida. */
  conquistadaEm: string | null;
}

export interface ResumoGamificacao {
  usuarioId: number;
  pontos: number;
  xp: number;
  nivel: string;
  nivelNumero: number;
  xpProximoNivel: number;
  proximoNivel: string | null;
  conquistas: Conquista[];
  /** 'api' = veio da API .NET; 'local' = calculado no app a partir da API Java. */
  origem: 'api' | 'local';
}

/** GET /api/progresso */
export interface ProgressoApi {
  usuarioId: string;
  xpTotal: number;
  nivel: string;
  kgEntregues: number;
  medalhas: string[];
  bairro: string | null;
}

/** GET /api/missoes */
export interface MissaoApi {
  id: number;
  titulo: string;
  descricao: string;
  tipo: 'ENTREGA' | 'QUIZ' | 'IDENTIFICACAO' | 'REFORCO' | string;
  meta: number;
  xp: number;
  progresso: number;
  concluida: boolean;
}

/** GET /api/quiz/hoje */
export interface PerguntaQuiz {
  id: number;
  enunciado: string;
  alternativas: string[];
  categoria: string;
}

/** POST /api/quiz/respostas */
export interface RespostaQuiz {
  correta: boolean;
  xpConcedido: number;
  xpQuizHoje: number;
  limiteDiario: number;
  mensagem: string;
}
