import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { mensagemDeErro } from '@/services/api';
import { iaService } from '@/services/iaService';
import { identificacaoService } from '@/services/identificacaoService';
import type { ClassificacaoIA, Identificacao, Material } from '@/types/api';

export type EtapaIdentificacao = 'inicio' | 'analisando' | 'resultado' | 'corrigindo' | 'concluido';

interface ResultadoIdentificacao {
  imagemUri: string;
  classificacao: ClassificacaoIA;
  material: Material | null;
  registro: Identificacao | null;
}

/**
 * Fluxo completo de identificação:
 * foto → IA classifica → material correspondente no Java → registro no Oracle
 * → usuário confirma ou corrige.
 */
export function useIdentificacao() {
  const usuario = useUsuarioLogado();
  const { materiais } = useCatalogo();

  const [etapa, setEtapa] = useState<EtapaIdentificacao>('inicio');
  const [resultado, setResultado] = useState<ResultadoIdentificacao | null>(null);
  const [materialFinal, setMaterialFinal] = useState<Material | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function escolherImagem(origem: 'camera' | 'galeria') {
    setErro(null);
    const permissao =
      origem === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      setErro(
        origem === 'camera'
          ? 'Precisamos da permissão da câmera para identificar o resíduo. Ative nas configurações do aparelho.'
          : 'Precisamos acessar suas fotos para identificar o resíduo.',
      );
      return;
    }

    const opcoes: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
    };
    const escolha =
      origem === 'camera'
        ? await ImagePicker.launchCameraAsync(opcoes)
        : await ImagePicker.launchImageLibraryAsync(opcoes);

    if (escolha.canceled || !escolha.assets?.[0]) return;
    await analisar(escolha.assets[0].uri, escolha.assets[0].mimeType ?? undefined);
  }

  async function analisar(imagemUri: string, mimeType?: string) {
    setEtapa('analisando');
    setAviso(null);
    try {
      const classificacao = await iaService.identificar(imagemUri, mimeType);
      const material = iaService.encontrarMaterial(classificacao, materiais);

      let registro: Identificacao | null = null;
      if (material) {
        try {
          registro = await identificacaoService.registrar(
            usuario.id,
            material.id,
            classificacao.confianca,
          );
        } catch (e) {
          setAviso(`Identificação feita, mas não foi salva no histórico: ${mensagemDeErro(e)}`);
        }
      }

      setResultado({ imagemUri, classificacao, material, registro });
      setMaterialFinal(material);
      setEtapa(material ? 'resultado' : 'corrigindo');
      if (!material) {
        setAviso('Não encontramos esse material no catálogo. Escolha o mais parecido.');
      }
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível analisar a imagem. Tente outra foto.'));
      setEtapa('inicio');
    }
  }

  /** Usuário confirma que a IA acertou. */
  async function confirmar() {
    if (!resultado) return;
    setSalvando(true);
    try {
      if (resultado.registro) {
        await identificacaoService.confirmar(resultado.registro.id, usuario.id, true);
      }
      setEtapa('concluido');
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  /** Usuário corrige: registra o material escolhido com confiança 1 e confirmado. */
  async function corrigir(material: Material) {
    if (!resultado) return;
    setSalvando(true);
    setErro(null);
    try {
      const novo = await identificacaoService.registrar(usuario.id, material.id, 1);
      await identificacaoService.confirmar(novo.id, usuario.id, true);
      setMaterialFinal(material);
      setEtapa('concluido');
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  function reiniciar() {
    setEtapa('inicio');
    setResultado(null);
    setMaterialFinal(null);
    setErro(null);
    setAviso(null);
  }

  return {
    etapa,
    resultado,
    materialFinal,
    materiais,
    erro,
    aviso,
    salvando,
    modoSimulado: iaService.modoSimulado,
    escolherImagem,
    confirmar,
    corrigir,
    abrirCorrecao: () => setEtapa('corrigindo'),
    voltarAoResultado: () => setEtapa(resultado?.material ? 'resultado' : 'inicio'),
    reiniciar,
  };
}
