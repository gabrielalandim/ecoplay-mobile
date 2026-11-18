const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Converte "yyyy-MM-dd" em Date local (sem deslocamento de fuso). */
export function parseDataIso(iso: string): Date {
  const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/** Date -> "yyyy-MM-dd" (formato aceito pelo LocalDate do Java). */
export function paraDataIso(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/** "2026-11-21" -> "sáb, 21 nov" */
export function formatarDataCurta(iso: string): string {
  const data = parseDataIso(iso);
  return `${DIAS_SEMANA[data.getDay()]}, ${data.getDate()} ${MESES[data.getMonth()]}`;
}

/** "2026-11-21" -> "21/11/2026" */
export function formatarData(iso: string | null): string {
  if (!iso) return '—';
  const data = parseDataIso(iso);
  return data.toLocaleDateString('pt-BR');
}

export function formatarPeso(kg: number): string {
  return `${kg.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg`;
}

export function formatarPercentual(valor: number | null): string {
  if (valor === null || valor === undefined) return '—';
  return `${Math.round(valor * 100)}%`;
}

export function hojeIso(): string {
  return paraDataIso(new Date());
}

export function ehHojeOuFuturo(iso: string): boolean {
  return iso >= hojeIso();
}

/** Próximos N dias a partir de hoje, para seleção rápida de data. */
export function proximosDias(quantidade: number): string[] {
  const hoje = new Date();
  return Array.from({ length: quantidade }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
    return paraDataIso(d);
  });
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

export function somarPesos(itens: { pesoKg: number }[]): number {
  return itens.reduce((total, item) => total + Number(item.pesoKg), 0);
}

/** Normaliza texto para buscas sem acento e sem diferenciar maiúsculas. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function saudacaoPorHorario(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}
