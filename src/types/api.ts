/**
 * Tipos espelhando os DTOs da API Java (br.com.fiap.ecoplay.dto).
 * Qualquer mudança de contrato no backend deve ser refletida aqui.
 */

export type Role = 'CIDADAO' | 'COOPERATIVA';
export type CategoriaMaterial =
  'PAPEL' | 'PLASTICO' | 'VIDRO' | 'METAL' | 'ORGANICO' | 'ESPECIAL' | 'REJEITO';
export type StatusEntrega = 'AGENDADA' | 'CONFIRMADA' | 'CONCLUIDA' | 'RECUSADA';
export type MotivoRecusa = 'CONTAMINADO' | 'MATERIAL_NAO_ACEITO' | 'NAO_COMPARECEU' | 'OUTRO';
export type TipoPonto = 'COOPERATIVA' | 'ECOPONTO' | 'PONTO_ESPECIAL';

/** Formato do Page<T> do Spring Data. */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** Corpo de erro do GlobalExceptionHandler. */
export interface ApiErrorBody {
  status: number;
  erro: string;
  mensagem: string;
  caminho: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
  bairro: string | null;
  dataCadastro: string | null;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  usuario: Usuario;
}

export interface CadastroUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  role: Role;
  bairro?: string;
}

export interface Material {
  id: number;
  nome: string;
  categoria: CategoriaMaterial;
  reciclavel: boolean;
  comoPreparar: string | null;
  classeModelo: string | null;
}

export interface PontoDescarte {
  id: number;
  nome: string;
  tipo: TipoPonto;
  endereco: string;
  bairro: string;
  horario: string | null;
  cooperativaId: number | null;
  materiaisAceitosIds: number[];
}

export interface PontoDescarteRequest {
  nome: string;
  tipo: TipoPonto;
  endereco: string;
  bairro: string;
  horario?: string;
  cooperativaId: number;
  materiaisAceitosIds: number[];
}

export interface EntregaItem {
  id: number;
  materialId: number;
  pesoKg: number;
}

export interface Entrega {
  id: number;
  cidadaoId: number;
  pontoId: number;
  dataPrevista: string;
  status: StatusEntrega;
  motivoRecusa: MotivoRecusa | null;
  observacao: string | null;
  criadoEm: string | null;
  atualizadoEm: string | null;
  itens: EntregaItem[];
}

export interface EntregaItemRequest {
  materialId: number;
  pesoKg: number;
}

export interface EntregaRequest {
  pontoId: number;
  /** yyyy-MM-dd */
  dataPrevista: string;
  itens: EntregaItemRequest[];
}

export interface Identificacao {
  id: number;
  usuarioId: number;
  materialId: number;
  confianca: number | null;
  confirmadaPeloUsuario: boolean;
  criadoEm: string | null;
}

/** Resposta do microsserviço de IA (POST /api/ia/identificar). */
export interface ClassificacaoIA {
  classeModelo: string;
  categoria: CategoriaMaterial;
  confianca: number;
}
