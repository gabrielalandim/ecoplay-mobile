import { Platform } from 'react-native';

import { iaApi } from './api';
import { env } from '@/config/env';
import type { ClassificacaoIA, Material } from '@/types/api';

/**
 * Classes do modelo combinadas com o time de IA (Python) e com o campo
 * `classeModelo` dos materiais cadastrados na API Java.
 */
const CLASSES_SIMULADAS: Omit<ClassificacaoIA, 'confianca'>[] = [
  { classeModelo: 'garrafa_pet', categoria: 'PLASTICO' },
  { classeModelo: 'lata_aluminio', categoria: 'METAL' },
  { classeModelo: 'garrafa_vidro', categoria: 'VIDRO' },
  { classeModelo: 'papelao', categoria: 'PAPEL' },
  { classeModelo: 'casca_fruta', categoria: 'ORGANICO' },
  { classeModelo: 'pilha', categoria: 'ESPECIAL' },
  { classeModelo: 'guardanapo_sujo', categoria: 'REJEITO' },
];

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Gera um índice estável a partir do caminho da imagem (mesma foto = mesmo resultado). */
function hashTexto(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i += 1) {
    hash = (hash * 31 + texto.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

async function identificarSimulado(imagemUri: string): Promise<ClassificacaoIA> {
  await esperar(1200);
  const hash = hashTexto(imagemUri);
  const classe = CLASSES_SIMULADAS[hash % CLASSES_SIMULADAS.length];
  const confianca = 0.55 + ((hash % 43) / 100); // entre 0.55 e 0.97
  return { ...classe, confianca: Math.round(confianca * 100) / 100 };
}

async function identificarReal(imagemUri: string, mimeType?: string): Promise<ClassificacaoIA> {
  const formData = new FormData();
  const nomeArquivo = imagemUri.split('/').pop() ?? 'residuo.jpg';
  const tipo = mimeType ?? 'image/jpeg';

  if (Platform.OS === 'web') {
    const blob = await (await fetch(imagemUri)).blob();
    formData.append('file', blob, nomeArquivo);
  } else {
    // Formato aceito pelo FormData do React Native para upload de arquivos.
    formData.append('file', { uri: imagemUri, name: nomeArquivo, type: tipo } as unknown as Blob);
  }

  const { data } = await iaApi.post<ClassificacaoIA>('/api/ia/identificar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return data;
}

export const iaService = {
  modoSimulado: env.iaMock,

  /** POST /api/ia/identificar (multipart/form-data, campo "file"). */
  identificar(imagemUri: string, mimeType?: string): Promise<ClassificacaoIA> {
    return env.iaMock ? identificarSimulado(imagemUri) : identificarReal(imagemUri, mimeType);
  },

  /** Encontra o material cadastrado no Java que corresponde à classificação. */
  encontrarMaterial(classificacao: ClassificacaoIA, materiais: Material[]): Material | null {
    const porClasse = materiais.find(
      (m) => m.classeModelo?.toLowerCase() === classificacao.classeModelo.toLowerCase(),
    );
    if (porClasse) return porClasse;
    return materiais.find((m) => m.categoria === classificacao.categoria) ?? null;
  },
};
