// Serviço para integração com API DataJud CNJ
export interface DataJudTribunal {
  sigla: string;
  nome: string;
  tipo: 'estadual' | 'federal' | 'trabalhista' | 'militar' | 'eleitoral';
  ativo: boolean;
}

export interface DataJudProcess {
  numeroProcesso: string;
  classe: {
    codigo: number;
    nome: string;
  };
  sistema: {
    codigo: number;
    nome: string;
  };
  formato: {
    codigo: number;
    nome: string;
  };
  tribunal: string;
  dataHoraUltimaAtualizacao: string;
  grau: string;
  dataAjuizamento: string;
  movimentos: DataJudMovement[];
  assuntos: Array<{
    codigo: number;
    nome: string;
    principal: boolean;
  }>;
  orgaoJulgador: {
    codigo: number;
    nome: string;
  };
}

export interface DataJudMovement {
  codigo: number;
  nome: string;
  dataHora: string;
  complementoTabelado?: Array<{
    codigo: number;
    nome: string;
    valor: string;
  }>;
  complemento?: string;
}

export interface DataJudSearchParams {
  numeroProcesso?: string;
  tribunal: string;
  apiKey: string;
}

class DataJudService {
  private baseUrl = 'https://api-publica.datajud.cnj.jus.br/api_publica_';
  
  // Lista de tribunais suportados pelo DataJud
  private tribunais: DataJudTribunal[] = [
    { sigla: 'tjsp', nome: 'Tribunal de Justiça de São Paulo', tipo: 'estadual', ativo: true },
    { sigla: 'tjrj', nome: 'Tribunal de Justiça do Rio de Janeiro', tipo: 'estadual', ativo: true },
    { sigla: 'tjba', nome: 'Tribunal de Justiça da Bahia', tipo: 'estadual', ativo: true },
    { sigla: 'tjmg', nome: 'Tribunal de Justiça de Minas Gerais', tipo: 'estadual', ativo: true },
    { sigla: 'tjrs', nome: 'Tribunal de Justiça do Rio Grande do Sul', tipo: 'estadual', ativo: true },
    { sigla: 'tjpr', nome: 'Tribunal de Justiça do Paraná', tipo: 'estadual', ativo: true },
    { sigla: 'tjsc', nome: 'Tribunal de Justiça de Santa Catarina', tipo: 'estadual', ativo: true },
    { sigla: 'tjgo', nome: 'Tribunal de Justiça de Goiás', tipo: 'estadual', ativo: true },
    { sigla: 'tjpe', nome: 'Tribunal de Justiça de Pernambuco', tipo: 'estadual', ativo: true },
    { sigla: 'tjce', nome: 'Tribunal de Justiça do Ceará', tipo: 'estadual', ativo: true },
    { sigla: 'trf1', nome: 'Tribunal Regional Federal da 1ª Região', tipo: 'federal', ativo: true },
    { sigla: 'trf2', nome: 'Tribunal Regional Federal da 2ª Região', tipo: 'federal', ativo: true },
    { sigla: 'trf3', nome: 'Tribunal Regional Federal da 3ª Região', tipo: 'federal', ativo: true },
    { sigla: 'trf4', nome: 'Tribunal Regional Federal da 4ª Região', tipo: 'federal', ativo: true },
    { sigla: 'trf5', nome: 'Tribunal Regional Federal da 5ª Região', tipo: 'federal', ativo: true },
    { sigla: 'trt1', nome: 'Tribunal Regional do Trabalho da 1ª Região', tipo: 'trabalhista', ativo: true },
    { sigla: 'trt2', nome: 'Tribunal Regional do Trabalho da 2ª Região', tipo: 'trabalhista', ativo: true },
    { sigla: 'trt3', nome: 'Tribunal Regional do Trabalho da 3ª Região', tipo: 'trabalhista', ativo: true },
    { sigla: 'trt5', nome: 'Tribunal Regional do Trabalho da 5ª Região', tipo: 'trabalhista', ativo: true },
    { sigla: 'tst', nome: 'Tribunal Superior do Trabalho', tipo: 'trabalhista', ativo: true },
    { sigla: 'stj', nome: 'Superior Tribunal de Justiça', tipo: 'federal', ativo: true },
    { sigla: 'stf', nome: 'Supremo Tribunal Federal', tipo: 'federal', ativo: true },
  ];

  getTribunais(): DataJudTribunal[] {
    return this.tribunais.filter(t => t.ativo);
  }

  getTribunaisByType(tipo: DataJudTribunal['tipo']): DataJudTribunal[] {
    return this.tribunais.filter(t => t.ativo && t.tipo === tipo);
  }

  async searchProcess(params: DataJudSearchParams): Promise<DataJudProcess | null> {
    try {
      const url = `${this.baseUrl}${params.tribunal}/_search`;
      
      // Simulação da chamada real à API
      console.log(`Consultando DataJud: ${url}`);
      console.log('Parâmetros:', params);
      
      // Simular latência da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dados mockados baseados na estrutura real do DataJud
      const mockProcess: DataJudProcess = {
        numeroProcesso: params.numeroProcesso || '1001234-56.2024.8.05.0001',
        classe: {
          codigo: 436,
          nome: 'Procedimento Comum Cível'
        },
        sistema: {
          codigo: 1,
          nome: 'PJe'
        },
        formato: {
          codigo: 1,
          nome: 'Eletrônico'
        },
        tribunal: params.tribunal.toUpperCase(),
        dataHoraUltimaAtualizacao: new Date().toISOString(),
        grau: 'G1',
        dataAjuizamento: '2024-01-15T10:30:00Z',
        assuntos: [
          {
            codigo: 1200,
            nome: 'Direito Civil',
            principal: true
          },
          {
            codigo: 1201,
            nome: 'Obrigações',
            principal: false
          }
        ],
        orgaoJulgador: {
          codigo: 1001,
          nome: '1ª Vara Cível de Salvador'
        },
        movimentos: [
          {
            codigo: 26,
            nome: 'Juntada',
            dataHora: '2024-12-10T14:30:00Z',
            complemento: 'Juntada de petição inicial aos autos'
          },
          {
            codigo: 193,
            nome: 'Expedição de Mandado',
            dataHora: '2024-12-08T10:15:00Z',
            complemento: 'Expedição de mandado de citação'
          },
          {
            codigo: 11,
            nome: 'Distribuição',
            dataHora: '2024-01-15T10:30:00Z',
            complemento: 'Distribuição por sorteio'
          }
        ]
      };

      return mockProcess;
    } catch (error) {
      console.error('Erro ao consultar DataJud:', error);
      return null;
    }
  }

  async getProcessMovements(numeroProcesso: string, tribunal: string, apiKey: string): Promise<DataJudMovement[]> {
    try {
      const url = `${this.baseUrl}${tribunal}/_search`;
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return [
        {
          codigo: 26,
          nome: 'Juntada',
          dataHora: new Date().toISOString(),
          complemento: 'Nova movimentação capturada automaticamente'
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      return [];
    }
  }

  validateApiKey(apiKey: string): boolean {
    // Validação básica da chave da API
    return apiKey && apiKey.length >= 32;
  }

  formatProcessNumber(numero: string): string {
    // Remove caracteres não numéricos e formata
    const clean = numero.replace(/\D/g, '');
    if (clean.length === 20) {
      return clean.replace(/(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})/, '$1-$2.$3.$4.$5.$6');
    }
    return numero;
  }
}

export const dataJudService = new DataJudService();