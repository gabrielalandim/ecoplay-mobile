import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useRecurso } from '@/hooks/useRecurso';
import { mensagemDeErro } from '@/services/api';
import { entregaService } from '@/services/entregaService';
import { pedirConfirmacao } from '@/utils/dialog';
import { formatarDataCurta } from '@/utils/format';

/** Detalhe de uma entrega do cidadão, com reagendamento e cancelamento. */
export function useEntregaDetalhe(entregaId: number, recemCriada: boolean) {
  const router = useRouter();
  const usuario = useUsuarioLogado();

  const buscar = useCallback(
    () => entregaService.buscarDoCidadao(entregaId, usuario.id),
    [entregaId, usuario.id],
  );
  const { dados: entrega, carregando, erro, recarregar, setDados } = useRecurso(buscar);

  const [reagendando, setReagendando] = useState(false);
  const [novaData, setNovaData] = useState<string | null>(null);
  const [processando, setProcessando] = useState<'reagendar' | 'excluir' | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(
    recemCriada
      ? 'Entrega agendada! Leve os materiais limpos e separados na data escolhida.'
      : null,
  );

  function abrirReagendamento() {
    if (!entrega) return;
    setNovaData(entrega.dataPrevista);
    setReagendando(true);
  }

  async function reagendar() {
    if (!entrega || !novaData) return;
    setProcessando('reagendar');
    setErroAcao(null);
    try {
      const atualizada = await entregaService.reagendar(entrega.id, usuario.id, novaData);
      setDados(atualizada);
      setReagendando(false);
      setSucesso(`Entrega reagendada para ${formatarDataCurta(novaData)}.`);
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível reagendar.'));
    } finally {
      setProcessando(null);
    }
  }

  async function excluir() {
    if (!entrega) return;
    const confirmado = await pedirConfirmacao({
      titulo: 'Cancelar agendamento?',
      mensagem: 'A entrega será excluída e a cooperativa não vai mais esperar por ela.',
      textoConfirmar: 'Cancelar entrega',
      destrutivo: true,
    });
    if (!confirmado) return;

    setProcessando('excluir');
    setErroAcao(null);
    try {
      await entregaService.excluir(entrega.id, usuario.id);
      router.back();
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível cancelar a entrega.'));
      setProcessando(null);
    }
  }

  return {
    entrega,
    carregando,
    erro,
    recarregar,
    reagendando,
    fecharReagendamento: () => setReagendando(false),
    abrirReagendamento,
    novaData,
    setNovaData,
    processando,
    erroAcao,
    sucesso,
    reagendar,
    excluir,
  };
}
