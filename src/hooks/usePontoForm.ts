import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { mensagemDeErro } from '@/services/api';
import { pontoDescarteService } from '@/services/pontoDescarteService';
import type { TipoPonto } from '@/types/api';
import { validarObrigatorio } from '@/utils/validation';

export interface CamposPonto {
  nome: string;
  tipo: TipoPonto;
  endereco: string;
  bairro: string;
  horario: string;
  materiais: number[];
}

type ErrosPonto = Partial<Record<'nome' | 'endereco' | 'bairro' | 'materiais', string | null>>;

const VAZIO: CamposPonto = {
  nome: '',
  tipo: 'COOPERATIVA',
  endereco: '',
  bairro: '',
  horario: '',
  materiais: [],
};

/**
 * Cadastro e edição de ponto de descarte (POST/PUT /api/pontos-descarte).
 * Com `pontoId`, carrega o ponto existente e salva como edição.
 */
export function usePontoForm(pontoId: number | null) {
  const router = useRouter();
  const usuario = useUsuarioLogado();
  const { recarregar: recarregarCatalogo } = useCatalogo();

  const [campos, setCampos] = useState<CamposPonto>(VAZIO);
  const [erros, setErros] = useState<ErrosPonto>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(!!pontoId);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!pontoId) return;
    let ativo = true;
    pontoDescarteService
      .buscarPorId(pontoId)
      .then((ponto) => {
        if (!ativo) return;
        setCampos({
          nome: ponto.nome,
          tipo: ponto.tipo,
          endereco: ponto.endereco,
          bairro: ponto.bairro,
          horario: ponto.horario ?? '',
          materiais: ponto.materiaisAceitosIds,
        });
      })
      .catch((e) => ativo && setErroGeral(mensagemDeErro(e)))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [pontoId]);

  function alterar<K extends keyof CamposPonto>(campo: K, valor: CamposPonto[K]) {
    setCampos((c) => ({ ...c, [campo]: valor }));
    if (campo in erros) setErros((e) => ({ ...e, [campo]: null }));
  }

  function alternarMaterial(materialId: number) {
    alterar(
      'materiais',
      campos.materiais.includes(materialId)
        ? campos.materiais.filter((m) => m !== materialId)
        : [...campos.materiais, materialId],
    );
  }

  async function salvar() {
    const novosErros: ErrosPonto = {
      nome: validarObrigatorio(campos.nome, 'o nome do ponto'),
      endereco: validarObrigatorio(campos.endereco, 'o endereço'),
      bairro: validarObrigatorio(campos.bairro, 'o bairro'),
      materiais: campos.materiais.length === 0 ? 'Selecione ao menos um material aceito.' : null,
    };
    setErros(novosErros);
    setErroGeral(null);
    if (Object.values(novosErros).some(Boolean)) return;

    const dados = {
      nome: campos.nome.trim(),
      tipo: campos.tipo,
      endereco: campos.endereco.trim(),
      bairro: campos.bairro.trim(),
      horario: campos.horario.trim() || undefined,
      cooperativaId: usuario.id,
      materiaisAceitosIds: campos.materiais,
    };

    setSalvando(true);
    try {
      if (pontoId) await pontoDescarteService.atualizar(pontoId, dados);
      else await pontoDescarteService.cadastrar(dados);
      await recarregarCatalogo();
      router.back();
    } catch (e) {
      setErroGeral(mensagemDeErro(e, 'Não foi possível salvar o ponto.'));
    } finally {
      setSalvando(false);
    }
  }

  return {
    editando: !!pontoId,
    campos,
    erros,
    erroGeral,
    carregando,
    salvando,
    alterar,
    alternarMaterial,
    salvar,
  };
}
