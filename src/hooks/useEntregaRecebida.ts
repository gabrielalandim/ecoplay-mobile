import { useCallback, useState } from 'react';

import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useRecurso } from '@/hooks/useRecurso';
import { mensagemDeErro } from '@/services/api';
import { entregaService } from '@/services/entregaService';
import type { Entrega, MotivoRecusa } from '@/types/api';
import { pedirConfirmacao } from '@/utils/dialog';

export type AcaoEntregaRecebida = 'confirmar' | 'recusar' | 'concluir';

/** Entrega vista pela cooperativa: confirmar, concluir ou recusar com motivo. */
export function useEntregaRecebida(entregaId: number) {
  const usuario = useUsuarioLogado();

  // A API não tem GET por id para cooperativa: buscamos a lista e filtramos.
  const buscar = useCallback(async () => {
    const entregas = await entregaService.listarDaCooperativa(usuario.id);
    const entrega = entregas.find((e) => e.id === entregaId);
    if (!entrega) throw new Error('Entrega não encontrada para esta cooperativa.');
    return entrega;
  }, [entregaId, usuario.id]);

  const { dados: entrega, carregando, erro, recarregar, setDados } = useRecurso(buscar);

  const [processando, setProcessando] = useState<AcaoEntregaRecebida | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [recusando, setRecusando] = useState(false);
  const [motivo, setMotivo] = useState<MotivoRecusa | null>(null);
  const [observacao, setObservacao] = useState('');

  async function executar(
    acao: AcaoEntregaRecebida,
    chamada: () => Promise<Entrega>,
    mensagem: string,
  ) {
    setProcessando(acao);
    setErroAcao(null);
    setSucesso(null);
    try {
      const atualizada = await chamada();
      setDados(atualizada);
      setSucesso(mensagem);
      return true;
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
      return false;
    } finally {
      setProcessando(null);
    }
  }

  async function confirmar() {
    if (!entrega) return;
    await executar(
      'confirmar',
      () => entregaService.confirmar(entrega.id, usuario.id),
      'Entrega confirmada. O cidadão já pode trazer os materiais.',
    );
  }

  async function concluir() {
    if (!entrega) return;
    const ok = await pedirConfirmacao({
      titulo: 'Concluir entrega?',
      mensagem:
        'Confirme que os materiais foram recebidos e conferidos. Isso gera os pontos do cidadão.',
      textoConfirmar: 'Concluir',
    });
    if (!ok) return;
    await executar(
      'concluir',
      () => entregaService.concluir(entrega.id, usuario.id),
      'Entrega concluída! Os pontos do cidadão serão calculados.',
    );
  }

  function abrirRecusa() {
    setErroAcao(null);
    setRecusando(true);
  }

  async function recusar() {
    if (!entrega || !motivo) return;
    const ok = await executar(
      'recusar',
      () => entregaService.recusar(entrega.id, usuario.id, motivo, observacao),
      'Entrega recusada. O cidadão verá o motivo informado.',
    );
    if (ok) {
      setRecusando(false);
      setMotivo(null);
      setObservacao('');
    }
  }

  const status = entrega?.status;
  const podeConfirmar = status === 'AGENDADA';
  const podeConcluir = status === 'CONFIRMADA';

  return {
    entrega,
    carregando,
    erro,
    recarregar,
    processando,
    erroAcao,
    sucesso,
    podeConfirmar,
    podeConcluir,
    podeRecusar: podeConfirmar || podeConcluir,
    recusando,
    abrirRecusa,
    fecharRecusa: () => setRecusando(false),
    motivo,
    setMotivo,
    observacao,
    setObservacao,
    confirmar,
    concluir,
    recusar,
  };
}
