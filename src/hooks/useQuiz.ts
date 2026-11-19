import { useCallback, useState } from 'react';

import { useRecurso } from '@/hooks/useRecurso';
import { mensagemDeErro } from '@/services/api';
import { gamificacaoService } from '@/services/gamificacaoService';
import type { RespostaQuiz } from '@/types/gamificacao';

/**
 * Quiz diário da API .NET: uma pergunta por vez, resposta conferida no servidor
 * (o app nunca recebe o gabarito) e XP somado ao longo da rodada.
 */
export function useQuiz() {
  const buscar = useCallback(() => gamificacaoService.quizDoDia(), []);
  const { dados: perguntas, carregando, erro, recarregar } = useRecurso(buscar);

  const [indice, setIndice] = useState(0);
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const [resposta, setResposta] = useState<RespostaQuiz | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroResposta, setErroResposta] = useState<string | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [xpGanho, setXpGanho] = useState(0);

  const total = perguntas?.length ?? 0;
  const pergunta = perguntas?.[indice] ?? null;
  const terminou = total > 0 && indice >= total;

  async function responder(alternativa: number) {
    if (!pergunta || resposta || enviando) return;
    setEscolhida(alternativa);
    setEnviando(true);
    setErroResposta(null);
    try {
      const resultado = await gamificacaoService.responderQuiz(pergunta.id, alternativa);
      setResposta(resultado);
      if (resultado.correta) setAcertos((a) => a + 1);
      setXpGanho((xp) => xp + resultado.xpConcedido);
    } catch (e) {
      setEscolhida(null);
      setErroResposta(mensagemDeErro(e, 'Não foi possível enviar a resposta.'));
    } finally {
      setEnviando(false);
    }
  }

  function proxima() {
    setIndice((i) => i + 1);
    setEscolhida(null);
    setResposta(null);
    setErroResposta(null);
  }

  function recomecar() {
    setIndice(0);
    setEscolhida(null);
    setResposta(null);
    setErroResposta(null);
    setAcertos(0);
    setXpGanho(0);
  }

  return {
    carregando,
    erro,
    recarregar,
    pergunta,
    numero: indice + 1,
    total,
    terminou,
    escolhida,
    resposta,
    enviando,
    erroResposta,
    acertos,
    xpGanho,
    responder,
    proxima,
    recomecar,
  };
}
