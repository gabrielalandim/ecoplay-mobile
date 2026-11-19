import type { Entrega, Identificacao, Material } from '@/types/api';
import type { Conquista, ResumoGamificacao } from '@/types/gamificacao';
import { hojeIso, somarPesos } from '@/utils/format';

/**
 * Cálculo local da gamificação, usado enquanto a API .NET não está no ar.
 * As regras usam só dados reais da API Java (entregas e identificações),
 * então os números batem com o restante do app.
 */

export const REGRAS_PONTOS = {
  porKgConcluido: 10,
  porEntregaConcluida: 20,
  porIdentificacaoConfirmada: 5,
} as const;

const NIVEIS = [
  { nome: 'Semente', xpMinimo: 0 },
  { nome: 'Muda', xpMinimo: 100 },
  { nome: 'Árvore', xpMinimo: 300 },
  { nome: 'Floresta', xpMinimo: 700 },
  { nome: 'Bioma', xpMinimo: 1500 },
];

function dataDaEntrega(entrega: Entrega): string {
  return (entrega.atualizadoEm ?? entrega.dataPrevista).slice(0, 10);
}

/** Data em que a conquista foi atingida (o n-ésimo evento), ou null se ainda não. */
function dataDoEnesimo(datas: string[], n: number): string | null {
  if (datas.length < n) return null;
  return [...datas].sort()[n - 1] ?? hojeIso();
}

export function calcularResumoLocal(
  usuarioId: number,
  entregas: Entrega[],
  identificacoes: Identificacao[],
  materialPorId: (id: number) => Material | undefined,
): ResumoGamificacao {
  const concluidas = entregas.filter((e) => e.status === 'CONCLUIDA');
  const recusadas = entregas.filter((e) => e.status === 'RECUSADA');
  const confirmadas = identificacoes.filter((i) => i.confirmadaPeloUsuario);

  const kgConcluidos = somarPesos(concluidas.flatMap((e) => e.itens));
  const kgVidro = somarPesos(
    concluidas
      .flatMap((e) => e.itens)
      .filter((item) => materialPorId(item.materialId)?.categoria === 'VIDRO'),
  );

  const xp =
    Math.round(kgConcluidos * REGRAS_PONTOS.porKgConcluido) +
    concluidas.length * REGRAS_PONTOS.porEntregaConcluida +
    confirmadas.length * REGRAS_PONTOS.porIdentificacaoConfirmada;

  const indiceNivel = NIVEIS.reduce((atual, nivel, i) => (xp >= nivel.xpMinimo ? i : atual), 0);
  const proximo = NIVEIS[indiceNivel + 1];

  const datasConcluidas = concluidas.map(dataDaEntrega);
  const datasIdentificacoes = confirmadas.map((i) => (i.criadoEm ?? hojeIso()).slice(0, 10));

  const conquistas: Conquista[] = [
    {
      id: 1,
      nome: 'Primeira entrega',
      descricao: 'Conclua a primeira entrega em uma cooperativa.',
      conquistadaEm: dataDoEnesimo(datasConcluidas, 1),
    },
    {
      id: 2,
      nome: 'Olho clínico',
      descricao: `Confirme 5 identificações com a câmera (${Math.min(confirmadas.length, 5)}/5).`,
      conquistadaEm: dataDoEnesimo(datasIdentificacoes, 5),
    },
    {
      id: 3,
      nome: 'Guardião do vidro',
      descricao: `Entregue 10 kg de vidro (${kgVidro.toLocaleString('pt-BR')}/10 kg).`,
      conquistadaEm:
        kgVidro >= 10
          ? ([...datasConcluidas].sort()[datasConcluidas.length - 1] ?? hojeIso())
          : null,
    },
    {
      id: 4,
      nome: 'Mestre da separação',
      descricao: 'Conclua 5 entregas sem nenhuma recusada.',
      conquistadaEm: recusadas.length === 0 ? dataDoEnesimo(datasConcluidas, 5) : null,
    },
  ];

  return {
    usuarioId,
    pontos: xp,
    xp,
    nivel: NIVEIS[indiceNivel].nome,
    nivelNumero: indiceNivel + 1,
    xpProximoNivel: proximo?.xpMinimo ?? xp,
    proximoNivel: proximo?.nome ?? null,
    conquistas,
  };
}
