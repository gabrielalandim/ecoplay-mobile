import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { mensagemDeErro } from '@/services/api';
import { entregaService } from '@/services/entregaService';
import { hojeIso } from '@/utils/format';
import { parsePeso } from '@/utils/validation';

interface ParametrosIniciais {
  pontoId?: string;
  materialId?: string;
}

/**
 * Formulário de agendamento: ponto, data e materiais com peso.
 * Os materiais exibidos são só os aceitos pelo ponto escolhido.
 */
export function useNovaEntrega(params: ParametrosIniciais) {
  const router = useRouter();
  const usuario = useUsuarioLogado();
  const catalogo = useCatalogo();
  const { pontos, materialPorId } = catalogo;

  const [pontoId, setPontoId] = useState<number | null>(
    params.pontoId ? Number(params.pontoId) : null,
  );
  const [data, setData] = useState<string | null>(hojeIso());
  /** materialId -> peso digitado (texto) */
  const [pesos, setPesos] = useState<Record<number, string>>(
    params.materialId ? { [Number(params.materialId)]: '' } : {},
  );
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const ponto = pontos.find((p) => p.id === pontoId);
  const materiaisDoPonto = useMemo(
    () =>
      (ponto?.materiaisAceitosIds ?? [])
        .map((id) => materialPorId(id))
        .filter((m): m is NonNullable<typeof m> => !!m),
    [ponto, materialPorId],
  );

  const selecionados = Object.keys(pesos)
    .map(Number)
    .filter((id) => materiaisDoPonto.some((m) => m.id === id));
  const pesoTotal = selecionados.reduce((total, id) => total + (parsePeso(pesos[id]) ?? 0), 0);

  function escolherPonto(id: number) {
    setPontoId(id);
    setErro(null);
  }

  function alternarMaterial(id: number) {
    setErro(null);
    setPesos((atual) => {
      const copia = { ...atual };
      if (id in copia) delete copia[id];
      else copia[id] = '';
      return copia;
    });
  }

  function alterarPeso(materialId: number, texto: string) {
    setPesos((atual) => ({ ...atual, [materialId]: texto }));
  }

  async function agendar() {
    setErro(null);
    if (!pontoId) return setErro('Escolha o ponto de descarte.');
    if (!data) return setErro('Escolha a data da entrega.');
    if (selecionados.length === 0) return setErro('Selecione pelo menos um material.');

    const itens = selecionados.map((id) => ({ materialId: id, pesoKg: parsePeso(pesos[id]) }));
    const semPeso = itens.find((i) => i.pesoKg === null);
    if (semPeso) {
      const nome = materialPorId(semPeso.materialId)?.nome ?? 'o material';
      return setErro(`Informe um peso válido para ${nome.toLowerCase()} (ex.: 1,5).`);
    }

    setEnviando(true);
    try {
      const entrega = await entregaService.agendar(usuario.id, {
        pontoId,
        dataPrevista: data,
        itens: itens.map((i) => ({ materialId: i.materialId, pesoKg: i.pesoKg as number })),
      });
      router.replace(`/entrega/${entrega.id}?criada=1`);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível agendar a entrega.'));
    } finally {
      setEnviando(false);
    }
  }

  return {
    pontos,
    carregandoCatalogo: catalogo.carregando,
    erroCatalogo: catalogo.erro,
    recarregarCatalogo: catalogo.recarregar,
    pontoId,
    ponto,
    data,
    setData,
    pesos,
    materiaisDoPonto,
    selecionados,
    pesoTotal,
    erro,
    enviando,
    escolherPonto,
    alternarMaterial,
    alterarPeso,
    agendar,
  };
}
