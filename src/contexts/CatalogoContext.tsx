import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { mensagemDeErro } from '@/services/api';
import { materialService } from '@/services/materialService';
import { pontoDescarteService } from '@/services/pontoDescarteService';
import type { Material, PontoDescarte } from '@/types/api';

/**
 * Catálogo compartilhado (materiais e pontos de descarte).
 * Carregado uma vez e reutilizado pelas telas que precisam mostrar
 * nomes de materiais e pontos a partir dos IDs devolvidos pela API.
 */
interface CatalogoContextValue {
  materiais: Material[];
  pontos: PontoDescarte[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
  materialPorId: (id: number) => Material | undefined;
  pontoPorId: (id: number) => PontoDescarte | undefined;
}

const CatalogoContext = createContext<CatalogoContextValue | null>(null);

export function CatalogoProvider({ children }: { children: ReactNode }) {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [pontos, setPontos] = useState<PontoDescarte[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [listaMateriais, listaPontos] = await Promise.all([
        materialService.listar(),
        pontoDescarteService.listar(),
      ]);
      setMateriais(listaMateriais);
      setPontos(listaPontos);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível carregar materiais e pontos.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const value = useMemo<CatalogoContextValue>(() => {
    const mapaMateriais = new Map(materiais.map((m) => [m.id, m]));
    const mapaPontos = new Map(pontos.map((p) => [p.id, p]));
    return {
      materiais,
      pontos,
      carregando,
      erro,
      recarregar,
      materialPorId: (id) => mapaMateriais.get(id),
      pontoPorId: (id) => mapaPontos.get(id),
    };
  }, [materiais, pontos, carregando, erro, recarregar]);

  return <CatalogoContext.Provider value={value}>{children}</CatalogoContext.Provider>;
}

export function useCatalogo(): CatalogoContextValue {
  const contexto = useContext(CatalogoContext);
  if (!contexto) throw new Error('useCatalogo deve ser usado dentro de <CatalogoProvider>.');
  return contexto;
}
