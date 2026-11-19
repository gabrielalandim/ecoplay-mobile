import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { CategoriaMaterial, MotivoRecusa, StatusEntrega, TipoPonto } from '@/types/api';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface CategoriaInfo {
  label: string;
  /** Cor oficial da coleta seletiva (Resolução CONAMA 275/2001). */
  cor: string;
  corTexto: string;
  lixeira: string;
  icone: IconName;
}

export const CATEGORIAS: Record<CategoriaMaterial, CategoriaInfo> = {
  PAPEL: {
    label: 'Papel',
    cor: '#1E63B5',
    corTexto: '#FFFFFF',
    lixeira: 'azul',
    icone: 'newspaper-outline',
  },
  PLASTICO: {
    label: 'Plástico',
    cor: '#C62828',
    corTexto: '#FFFFFF',
    lixeira: 'vermelha',
    icone: 'water-outline',
  },
  VIDRO: {
    label: 'Vidro',
    cor: '#2E7D32',
    corTexto: '#FFFFFF',
    lixeira: 'verde',
    icone: 'wine-outline',
  },
  METAL: {
    label: 'Metal',
    cor: '#F2C200',
    corTexto: '#142019',
    lixeira: 'amarela',
    icone: 'construct-outline',
  },
  ORGANICO: {
    label: 'Orgânico',
    cor: '#6D4C41',
    corTexto: '#FFFFFF',
    lixeira: 'marrom',
    icone: 'leaf-outline',
  },
  ESPECIAL: {
    label: 'Especial',
    cor: '#EF7D00',
    corTexto: '#142019',
    lixeira: 'laranja (ponto especial)',
    icone: 'battery-charging-outline',
  },
  REJEITO: {
    label: 'Rejeito',
    cor: '#616161',
    corTexto: '#FFFFFF',
    lixeira: 'cinza',
    icone: 'trash-outline',
  },
};

export const CATEGORIAS_LISTA = Object.keys(CATEGORIAS) as CategoriaMaterial[];

interface StatusInfo {
  label: string;
  cor: string;
  fundo: string;
  icone: IconName;
}

export const STATUS_ENTREGA: Record<StatusEntrega, StatusInfo> = {
  AGENDADA: { label: 'Agendada', cor: '#1E5AA8', fundo: '#E4EEFB', icone: 'calendar-outline' },
  CONFIRMADA: {
    label: 'Confirmada',
    cor: '#8A5A00',
    fundo: '#FFF4D6',
    icone: 'checkmark-circle-outline',
  },
  CONCLUIDA: { label: 'Concluída', cor: '#1E7A4C', fundo: '#E3F1E8', icone: 'trophy-outline' },
  RECUSADA: { label: 'Recusada', cor: '#B3261E', fundo: '#FCE8E6', icone: 'close-circle-outline' },
};

export const MOTIVOS_RECUSA: Record<MotivoRecusa, string> = {
  CONTAMINADO: 'Material contaminado',
  MATERIAL_NAO_ACEITO: 'Material não aceito no ponto',
  NAO_COMPARECEU: 'Cidadão não compareceu',
  OUTRO: 'Outro motivo',
};

export const TIPOS_PONTO: Record<TipoPonto, { label: string; icone: IconName }> = {
  COOPERATIVA: { label: 'Cooperativa', icone: 'people-outline' },
  ECOPONTO: { label: 'Ecoponto', icone: 'leaf-outline' },
  PONTO_ESPECIAL: { label: 'Ponto especial', icone: 'warning-outline' },
};

/** Abaixo deste valor a IA pede ajuda ao usuário ("É vidro ou plástico?"). */
export const CONFIANCA_MINIMA = 0.7;

/** Orientação padrão de preparo por categoria (usada quando o material não tem texto próprio). */
export const GUIA_PREPARO: Record<CategoriaMaterial, string[]> = {
  PAPEL: [
    'Mantenha seco e sem gordura.',
    'Desmonte as caixas para ocupar menos espaço.',
    'Papel engordurado ou papel higiênico vai no rejeito.',
  ],
  PLASTICO: [
    'Esvazie e dê uma enxaguada rápida.',
    'Amasse garrafas para economizar espaço.',
    'Tampas também são plástico: podem ir junto.',
  ],
  VIDRO: [
    'Esvazie e enxágue.',
    'Tire a tampa: ela vai no plástico ou no metal.',
    'Não quebre: vidro inteiro é mais seguro para o catador.',
  ],
  METAL: [
    'Enxágue latas de alimento.',
    'Amasse latinhas para economizar espaço.',
    'Aerossóis só vazios e sem perfurar.',
  ],
  ORGANICO: [
    'Separe restos de comida, cascas e borra de café.',
    'Ideal para compostagem doméstica ou comunitária.',
    'Não misture com recicláveis: contamina o material.',
  ],
  ESPECIAL: [
    'Nunca jogue no lixo comum: contamina solo e água.',
    'Leve a um ponto especial (pilhas, eletrônicos, lâmpadas, óleo).',
    'Óleo de cozinha: guarde em garrafa PET fechada.',
  ],
  REJEITO: [
    'Vai no lixo comum (não reciclável).',
    'Exemplos: papel higiênico, fraldas, guardanapos sujos.',
    'Reduzir o consumo é a melhor saída para o rejeito.',
  ],
};
