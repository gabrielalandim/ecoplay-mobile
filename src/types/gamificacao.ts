/**
 * Contrato esperado da API .NET de gamificação.
 * Documentado no README para o time de .NET seguir os mesmos nomes.
 */

export interface Conquista {
  id: number;
  nome: string;
  descricao: string;
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
}

export interface Recompensa {
  id: number;
  titulo: string;
  descricao: string;
  custoPontos: number;
  parceiro: string;
  disponivel: boolean;
}
