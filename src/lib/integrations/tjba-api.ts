// Simulação da API do TJ-BA
export interface TJBAProcessResponse {
  success: boolean;
  data?: {
    numero: string;
    cnj: string;
    assunto: string;
    classe: string;
    orgaoJulgador: string;
    comarca: string;
    fase: string;
    dataUltimaAtualizacao: string;
    movimentacoes: Array<{
      data: string;
      descricao: string;
      tipo: string;
    }>;
    partes: Array<{
      nome: string;
      tipo: 'autor' | 'reu' | 'terceiro';
      advogados: Array<{
        nome: string;
        oab: string;
      }>;
    }>;
  };
  error?: string;
}

export interface TJBASearchParams {
  type: 'numero' | 'oab' | 'cpf';
  value: string;
  tribunal?: string;
}

class TJBAService {
  private baseUrl = 'https://api.tjba.jus.br/v1'; // URL fictícia
  private apiKey = process.env.TJBA_API_KEY || 'demo-key';

  async searchProcess(params: TJBASearchParams): Promise<TJBAProcessResponse> {
    try {
      // Simulação de chamada à API real
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência

      // Dados mockados para demonstração
      const mockResponse: TJBAProcessResponse = {
        success: true,
        data: {
          numero: '1001234-56.2024.8.05.0001',
          cnj: '1001234-56.2024.8.05.0001',
          assunto: 'Ação de Cobrança',
          classe: 'Procedimento Comum',
          orgaoJulgador: '1ª Vara Cível de Salvador',
          comarca: 'Salvador',
          fase: 'Conhecimento',
          dataUltimaAtualizacao: '2024-12-10T14:30:00Z',
          movimentacoes: [
            {
              data: '2024-12-10T14:30:00Z',
              descricao: 'Juntada de petição inicial aos autos',
              tipo: 'andamento'
            },
            {
              data: '2024-12-08T10:15:00Z',
              descricao: 'Citação expedida para o réu João da Silva',
              tipo: 'citacao'
            },
            {
              data: '2024-12-05T16:45:00Z',
              descricao: 'Distribuição do processo',
              tipo: 'distribuicao'
            }
          ],
          partes: [
            {
              nome: 'Maria Santos',
              tipo: 'autor',
              advogados: [
                {
                  nome: 'Dr. João Silva',
                  oab: 'BA 12345'
                }
              ]
            },
            {
              nome: 'João da Silva',
              tipo: 'reu',
              advogados: []
            }
          ]
        }
      };

      return mockResponse;
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao consultar processo no TJ-BA'
      };
    }
  }

  async getProcessMovements(processNumber: string): Promise<TJBAProcessResponse> {
    try {
      // Simulação de busca de movimentações
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        data: {
          numero: processNumber,
          cnj: processNumber,
          assunto: 'Processo consultado',
          classe: 'N/A',
          orgaoJulgador: 'N/A',
          comarca: 'N/A',
          fase: 'N/A',
          dataUltimaAtualizacao: new Date().toISOString(),
          movimentacoes: [
            {
              data: new Date().toISOString(),
              descricao: 'Nova movimentação capturada automaticamente',
              tipo: 'andamento'
            }
          ],
          partes: []
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao buscar movimentações'
      };
    }
  }

  async validateOAB(oab: string): Promise<{ valid: boolean; name?: string }> {
    try {
      // Simulação de validação de OAB
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockOABs = {
        'BA 12345': 'Dr. João Silva',
        'BA 67890': 'Dra. Maria Santos',
        'BA 11111': 'Dr. Carlos Oliveira'
      };

      const name = mockOABs[oab as keyof typeof mockOABs];
      
      return {
        valid: !!name,
        name
      };
    } catch (error) {
      return { valid: false };
    }
  }
}

export const tjbaService = new TJBAService();