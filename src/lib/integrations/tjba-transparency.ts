// Serviço para API de Transparência do TJ-BA
export interface TJBAIndicator {
  id: string;
  nome: string;
  valor: number;
  unidade: string;
  periodo: string;
  categoria: 'produtividade' | 'qualidade' | 'eficiencia' | 'acesso';
}

export interface TJBAMeta {
  id: string;
  numero: number;
  descricao: string;
  valorMeta: number;
  valorAlcancado: number;
  percentualAlcancado: number;
  periodo: string;
  status: 'cumprida' | 'nao_cumprida' | 'em_andamento';
}

interface TJBAComarca {
  codigo: string;
  nome: string;
  regiao: string;
  populacao: number;
  varas: number;
  processos: {
    tramitando: number;
    baixados: number;
    distribuidos: number;
  };
}

class TJBATransparencyService {
  private baseUrl = 'https://transparencia.tjba.jus.br/api/v1'; // URL fictícia
  
  async getIndicadores(): Promise<TJBAIndicator[]> {
    try {
      // Simulação de dados de transparência
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockIndicadores: TJBAIndicator[] = [
        {
          id: '1',
          nome: 'Taxa de Congestionamento',
          valor: 68.5,
          unidade: '%',
          periodo: '2024',
          categoria: 'eficiencia'
        },
        {
          id: '2',
          nome: 'Índice de Produtividade dos Magistrados',
          valor: 1847,
          unidade: 'processos/magistrado',
          periodo: '2024',
          categoria: 'produtividade'
        },
        {
          id: '3',
          nome: 'Tempo Médio de Tramitação',
          valor: 2.3,
          unidade: 'anos',
          periodo: '2024',
          categoria: 'eficiencia'
        },
        {
          id: '4',
          nome: 'Taxa de Recorribilidade',
          valor: 15.2,
          unidade: '%',
          periodo: '2024',
          categoria: 'qualidade'
        },
        {
          id: '5',
          nome: 'Processos Eletrônicos',
          valor: 98.7,
          unidade: '%',
          periodo: '2024',
          categoria: 'acesso'
        }
      ];
      
      return mockIndicadores;
    } catch (error) {
      console.error('Erro ao buscar indicadores:', error);
      return [];
    }
  }

  async getMetas(): Promise<TJBAMeta[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockMetas: TJBAMeta[] = [
        {
          id: '1',
          numero: 1,
          descricao: 'Julgar processos mais antigos',
          valorMeta: 100,
          valorAlcancado: 87.3,
          percentualAlcancado: 87.3,
          periodo: '2024',
          status: 'em_andamento'
        },
        {
          id: '2',
          numero: 2,
          descricao: 'Julgar processos de execução mais antigos',
          valorMeta: 100,
          valorAlcancado: 92.1,
          percentualAlcancado: 92.1,
          periodo: '2024',
          status: 'em_andamento'
        },
        {
          id: '3',
          numero: 3,
          descricao: 'Aumentar casos solucionados por conciliação',
          valorMeta: 100,
          valorAlcancado: 105.2,
          percentualAlcancado: 105.2,
          periodo: '2024',
          status: 'cumprida'
        },
        {
          id: '4',
          numero: 4,
          descricao: 'Priorizar o julgamento dos processos relativos à corrupção',
          valorMeta: 100,
          valorAlcancado: 78.9,
          percentualAlcancado: 78.9,
          periodo: '2024',
          status: 'nao_cumprida'
        }
      ];
      
      return mockMetas;
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      return [];
    }
  }

  async getComarcas(): Promise<TJBAComarca[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockComarcas: TJBAComarca[] = [
        {
          codigo: '001',
          nome: 'Salvador',
          regiao: 'Metropolitana',
          populacao: 2872347,
          varas: 45,
          processos: {
            tramitando: 125430,
            baixados: 89234,
            distribuidos: 45678
          }
        },
        {
          codigo: '002',
          nome: 'Feira de Santana',
          regiao: 'Interior',
          populacao: 619609,
          varas: 12,
          processos: {
            tramitando: 34567,
            baixados: 23456,
            distribuidos: 12345
          }
        },
        {
          codigo: '003',
          nome: 'Vitória da Conquista',
          regiao: 'Interior',
          populacao: 341128,
          varas: 8,
          processos: {
            tramitando: 18765,
            baixados: 15432,
            distribuidos: 8765
          }
        },
        {
          codigo: '004',
          nome: 'Camaçari',
          regiao: 'Metropolitana',
          populacao: 304302,
          varas: 6,
          processos: {
            tramitando: 15678,
            baixados: 12345,
            distribuidos: 6789
          }
        }
      ];
      
      return mockComarcas;
    } catch (error) {
      console.error('Erro ao buscar comarcas:', error);
      return [];
    }
  }

  async getProcessosPorComarca(codigoComarca: string): Promise<any> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        comarca: codigoComarca,
        estatisticas: {
          totalProcessos: 125430,
          processosPorClasse: [
            { classe: 'Procedimento Comum', quantidade: 45678 },
            { classe: 'Execução', quantidade: 34567 },
            { classe: 'Monitória', quantidade: 23456 },
            { classe: 'Cautelar', quantidade: 12345 },
            { classe: 'Outros', quantidade: 9384 }
          ],
          processosPorAssunto: [
            { assunto: 'Direito Civil', quantidade: 56789 },
            { assunto: 'Direito do Consumidor', quantidade: 34567 },
            { assunto: 'Direito de Família', quantidade: 23456 },
            { assunto: 'Direito Empresarial', quantidade: 10618 }
          ]
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados da comarca:', error);
      return null;
    }
  }
}

export const tjbaTransparencyService = new TJBATransparencyService();