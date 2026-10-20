// src/types/oab.ts

export interface AdvogadoOabInfo {
  nome: string;
  tipo: string;
  oab: {
    numero: string;
    uf: string;
    tipo?: string;
  };
  quantidade_processos: number;
}

export interface ProcessoFonteCapa {
  classe?: string;
  assunto?: string;
  orgao_julgador?: string;
  comarca?: string;
  valor_causa?: {
    valor_formatado?: string;
  };
  data_distribuicao?: string;
}

export interface ProcessoFonteItem {
  sigla: string;
  nome: string;
  grau_formatado?: string;
  sistema?: string;
  capa?: ProcessoFonteCapa;
}

export interface ProcessoOabItem {
  numero_cnj: string;
  titulo_polo_ativo?: string;
  titulo_polo_passivo?: string;
  ano_inicio?: number;
  data_inicio?: string;
  data_ultima_movimentacao?: string;
  quantidade_movimentacoes?: number;
  fontes: ProcessoFonteItem[];
}

export interface RespostaConsultaOab {
  sucesso: boolean;
  advogado?: AdvogadoOabInfo;
  processos: ProcessoOabItem[];
  mensagem?: string;
  total?: number;
}
