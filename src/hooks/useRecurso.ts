import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { mensagemDeErro } from '@/services/api';

interface EstadoRecurso<T> {
  dados: T | null;
  carregando: boolean;
  atualizando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
  atualizar: () => Promise<void>;
  setDados: (dados: T) => void;
}

/**
 * Carrega um recurso da API sempre que a tela ganha foco,
 * expondo os estados de carregamento, erro e "puxar para atualizar".
 */
export function useRecurso<T>(buscar: () => Promise<T>): EstadoRecurso<T> {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const buscarRef = useRef(buscar);
  useEffect(() => {
    buscarRef.current = buscar;
  });
  const jaCarregou = useRef(false);

  const executar = useCallback(async (modo: 'inicial' | 'atualizar') => {
    if (modo === 'inicial' && !jaCarregou.current) setCarregando(true);
    if (modo === 'atualizar') setAtualizando(true);
    setErro(null);
    try {
      const resultado = await buscarRef.current();
      setDados(resultado);
      jaCarregou.current = true;
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      executar('inicial');
    }, [executar]),
  );

  return {
    dados,
    carregando,
    atualizando,
    erro,
    recarregar: () => executar('inicial'),
    atualizar: () => executar('atualizar'),
    setDados,
  };
}
