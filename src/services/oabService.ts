// src/services/oabService.ts
import { RespostaConsultaOab, ProcessoOabItem } from '../types/oab';

const CHAVE_STORAGE_API_KEY = 'astec_oab_api_key';

export function obterChaveApiSalva(): string {
  return localStorage.getItem(CHAVE_STORAGE_API_KEY) || import.meta.env.VITE_ESCAVADOR_API_KEY || '';
}

export function salvarChaveApi(chave: string): void {
  localStorage.setItem(CHAVE_STORAGE_API_KEY, chave.trim());
}

/**
 * Consulta processos reais de um advogado por OAB via API do Escavador v2
 * Rota oficial: GET https://api.escavador.com/api/v2/advogado/processos?oab_numero={numero}&oab_estado={uf}
 */
export async function consultarProcessosPorOab(
  oabNumero: string | number,
  oabEstado: string,
  chavePersonalizada?: string
): Promise<RespostaConsultaOab> {
  const token = (chavePersonalizada || obterChaveApiSalva()).trim();
  const numLimpo = String(oabNumero).replace(/\D/g, '');
  const ufLimpa = oabEstado.trim().toUpperCase();

  if (!numLimpo) {
    throw new Error('Informe um número de inscrição da OAB válido.');
  }

  if (!ufLimpa || ufLimpa.length !== 2) {
    throw new Error('Informe a UF da Seccional da OAB (ex: BA, SP, RJ).');
  }

  // Se não houver token configurado, retorna dados de demonstração com aviso para configurar a chave
  if (!token) {
    return {
      sucesso: false,
      mensagem: 'Chave de API não configurada. Clique em "Configurar Chave API" para inserir seu token do Escavador.',
      processos: [],
    };
  }

  try {
    const url = `https://api.escavador.com/api/v2/advogado/processos?oab_numero=${numLimpo}&oab_estado=${ufLimpa}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    if (response.status === 401) {
      throw new Error('Token de API do Escavador inválido ou expirado. Verifique sua chave.');
    }

    if (response.status === 404) {
      return {
        sucesso: true,
        advogado: {
          nome: 'Advogado(a) não localizado(a)',
          tipo: 'ADVOGADO',
          oab: { numero: numLimpo, uf: ufLimpa },
          quantidade_processos: 0,
        },
        processos: [],
        mensagem: `Nenhum processo localizado para a OAB/${ufLimpa} nº ${numLimpo}.`,
      };
    }

    if (response.status === 429) {
      throw new Error('Limite de requisições por minuto atingido no Escavador. Aguarde alguns instantes.');
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `Erro na consulta à API (Status ${response.status}).`);
    }

    const data = await response.json();

    const advogado = data.advogado_encontrado ? {
      nome: data.advogado_encontrado.nome,
      tipo: data.advogado_encontrado.tipo || 'ADVOGADO',
      oab: {
        numero: data.advogado_encontrado.oab?.numero || numLimpo,
        uf: data.advogado_encontrado.oab?.uf || ufLimpa,
        tipo: data.advogado_encontrado.oab?.tipo,
      },
      quantidade_processos: data.advogado_encontrado.quantidade_processos || (data.items?.length || 0),
    } : undefined;

    const processos: ProcessoOabItem[] = (data.items || []).map((p: any) => ({
      numero_cnj: p.numero_cnj,
      titulo_polo_ativo: p.titulo_polo_ativo || 'Não informado',
      titulo_polo_passivo: p.titulo_polo_passivo || 'Não informado',
      ano_inicio: p.ano_inicio,
      data_inicio: p.data_inicio,
      data_ultima_movimentacao: p.data_ultima_movimentacao,
      quantidade_movimentacoes: p.quantidade_movimentacoes,
      fontes: (p.fontes || []).map((f: any) => ({
        sigla: f.sigla || 'TJ',
        nome: f.nome || 'Tribunal',
        grau_formatado: f.grau_formatado,
        sistema: f.sistema,
        capa: {
          classe: f.capa?.classe || 'Procedimento Ordinário',
          assunto: f.capa?.assunto || 'Direito Geral',
          orgao_julgador: f.capa?.orgao_julgador || 'Vara Cível / Fazenda Pública',
          comarca: f.capa?.comarca || 'Comarca',
          valor_causa: f.capa?.valor_causa,
          data_distribuicao: f.capa?.data_distribuicao,
        },
      })),
    }));

    return {
      sucesso: true,
      advogado,
      processos,
      total: processos.length,
    };
  } catch (error: any) {
    return {
      sucesso: false,
      mensagem: error.message || 'Falha ao consultar processos na API do Escavador.',
      processos: [],
    };
  }
}
