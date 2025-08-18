const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// GET /api/integrations/config - Buscar configurações de integração (apenas admin)
router.get('/config', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { data: configs, error } = await supabase
      .from('integration_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Remover dados sensíveis antes de enviar
    const sanitizedConfigs = configs.map(config => ({
      ...config,
      api_key: config.api_key ? '***' : null,
      certificate_data: config.certificate_data ? '***' : null
    }));

    res.json(sanitizedConfigs);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      error: 'Erro ao buscar configurações'
    });
  }
});

// POST /api/integrations/config - Salvar configuração de integração (apenas admin)
router.post('/config', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const configData = {
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newConfig, error } = await supabase
      .from('integration_configs')
      .insert([configData])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Remover dados sensíveis da resposta
    const { api_key, certificate_data, ...sanitizedConfig } = newConfig;

    res.status(201).json({
      ...sanitizedConfig,
      api_key: api_key ? '***' : null,
      certificate_data: certificate_data ? '***' : null
    });
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({
      error: 'Erro ao salvar configuração'
    });
  }
});

// POST /api/integrations/datajud/search - Buscar processo no DataJud
router.post('/datajud/search', authenticateToken, async (req, res) => {
  try {
    const { numeroProcesso, tribunal } = req.body;

    if (!numeroProcesso || !tribunal) {
      return res.status(400).json({
        error: 'Número do processo e tribunal são obrigatórios'
      });
    }

    // Buscar configuração do DataJud
    const { data: config, error: configError } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('service', 'datajud')
      .eq('active', true)
      .single();

    if (configError || !config) {
      return res.status(400).json({
        error: 'Integração DataJud não configurada'
      });
    }

    // Aqui você faria a chamada real para a API do DataJud
    // Por enquanto, retornamos dados simulados
    const mockResult = {
      numeroProcesso,
      tribunal: tribunal.toUpperCase(),
      classe: {
        codigo: 436,
        nome: 'Procedimento Comum Cível'
      },
      assuntos: [
        {
          codigo: 1200,
          nome: 'Direito Civil',
          principal: true
        }
      ],
      orgaoJulgador: {
        codigo: 1001,
        nome: '1ª Vara Cível'
      },
      dataAjuizamento: '2024-01-15T10:30:00Z',
      movimentos: [
        {
          codigo: 26,
          nome: 'Juntada',
          dataHora: new Date().toISOString(),
          complemento: 'Juntada de petição inicial'
        }
      ]
    };

    res.json(mockResult);
  } catch (error) {
    console.error('Erro na busca DataJud:', error);
    res.status(500).json({
      error: 'Erro na busca DataJud'
    });
  }
});

// POST /api/integrations/tjba/transparency - Buscar dados de transparência TJ-BA
router.post('/tjba/transparency', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body; // 'indicators' ou 'metas'

    // Dados simulados de transparência
    if (type === 'indicators') {
      const mockIndicators = [
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
        }
      ];
      
      res.json(mockIndicators);
    } else if (type === 'metas') {
      const mockMetas = [
        {
          id: '1',
          numero: 1,
          descricao: 'Julgar processos mais antigos',
          valorMeta: 100,
          valorAlcancado: 87.3,
          percentualAlcancado: 87.3,
          periodo: '2024',
          status: 'em_andamento'
        }
      ];
      
      res.json(mockMetas);
    } else {
      res.status(400).json({
        error: 'Tipo de consulta inválido'
      });
    }
  } catch (error) {
    console.error('Erro na consulta TJ-BA:', error);
    res.status(500).json({
      error: 'Erro na consulta TJ-BA'
    });
  }
});

module.exports = router;