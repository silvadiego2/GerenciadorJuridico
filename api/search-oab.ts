// api/search-oab.ts

declare const process: any;

export default async function handler(req: any, res: any) {
  // Configuração básica de CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  const { oabNumber, oabState } = req.body || {};

  if (!oabNumber || !oabState) {
    return res.status(400).json({ error: 'O número da OAB e a UF são obrigatórios.' });
  }

  try {
    const datajudKey = (typeof process !== 'undefined' && process.env?.DATAJUD_API_KEY) || '';

    // Se a chave não estiver configurada, retorna os dados simulados para teste
    if (!datajudKey) {
      return res.status(200).json({
        warning: 'DATAJUD_API_KEY não configurada na Vercel. Retornando simulação.',
        processes: [
          {
            number: `8001234-56.2024.8.05.${oabState === 'BA' ? '0001' : '0000'}`,
            title: 'Procedimento Comum Cível',
            court: `TJ-${oabState.toUpperCase()}`,
            client_name: 'Cliente Identificado via OAB',
            subject: 'Obrigação de Fazer / Indenizatória',
            distribution_date: new Date().toISOString()
          }
        ]
      });
    }

    const response = await fetch('https://api-publica.datajud.cnj.jus.br/api_v1_consultar', {
      method: 'POST',
      headers: {
        'Authorization': `APIKey ${datajudKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: {
          match: {
            "dadosBasicos.polo.advogado.oab": `${oabNumber}/${oabState}`
          }
        }
      })
    });

    const result = await response.json();
    const hits = result.hits?.hits || [];

    const processes = hits.map((item: any) => {
      const src = item._source || {};
      return {
        number: src.numeroProcesso,
        title: src.classe?.nome || 'Processo Judicial',
        court: src.tribunal || `TJ-${oabState.toUpperCase()}`,
        client_name: src.dadosBasicos?.polo?.[0]?.parte?.nome || 'Parte a definir',
        subject: src.assunto?.nome || 'Geral',
        distribution_date: src.dataAjuizamento || new Date().toISOString()
      };
    });

    return res.status(200).json({ processes });
  } catch (error: any) {
    return res.status(500).json({ error: 'Falha ao consultar DataJud', details: error.message });
  }
}
