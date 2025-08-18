const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');

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

// GET /api/financial - Listar entradas financeiras
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status, client_id, process_id, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('financial_entries')
      .select(`
        *,
        client:clients(id, name),
        process:processes(id, number, subject),
        responsible:users!financial_entries_responsible_id_fkey(id, name)
      `)
      .order('due_date', { ascending: false });

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (client_id) {
      query = query.eq('client_id', client_id);
    }
    
    if (process_id) {
      query = query.eq('process_id', process_id);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: entries, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar entradas financeiras:', error);
    res.status(500).json({
      error: 'Erro ao buscar entradas financeiras'
    });
  }
});

// POST /api/financial - Criar entrada financeira
router.post('/', authenticateToken, async (req, res) => {
  try {
    const entryData = {
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newEntry, error } = await supabase
      .from('financial_entries')
      .insert([entryData])
      .select(`
        *,
        client:clients(id, name),
        process:processes(id, number, subject),
        responsible:users!financial_entries_responsible_id_fkey(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Erro ao criar entrada financeira:', error);
    res.status(500).json({
      error: 'Erro ao criar entrada financeira'
    });
  }
});

// PUT /api/financial/:id - Atualizar entrada financeira
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // Se está marcando como pago, adicionar data de pagamento
    if (req.body.status === 'pago' && !req.body.paid_at) {
      updateData.paid_at = new Date().toISOString();
    }

    const { data: updatedEntry, error } = await supabase
      .from('financial_entries')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        client:clients(id, name),
        process:processes(id, number, subject),
        responsible:users!financial_entries_responsible_id_fkey(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!updatedEntry) {
      return res.status(404).json({
        error: 'Entrada financeira não encontrada'
      });
    }

    res.json(updatedEntry);
  } catch (error) {
    console.error('Erro ao atualizar entrada financeira:', error);
    res.status(500).json({
      error: 'Erro ao atualizar entrada financeira'
    });
  }
});

// GET /api/financial/summary - Resumo financeiro
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { data: entries, error } = await supabase
      .from('financial_entries')
      .select('type, status, value');

    if (error) {
      throw error;
    }

    const summary = {
      totalReceitas: 0,
      totalDespesas: 0,
      saldoLiquido: 0,
      honorariosPendentes: 0,
      despesasVencidas: 0
    };

    entries.forEach(entry => {
      if (entry.type === 'honorario' || entry.type === 'receita') {
        if (entry.status === 'pago') {
          summary.totalReceitas += entry.value;
        } else if (entry.status === 'pendente') {
          summary.honorariosPendentes += entry.value;
        }
      } else if (entry.type === 'despesa') {
        if (entry.status === 'pago') {
          summary.totalDespesas += entry.value;
        } else if (entry.status === 'vencido') {
          summary.despesasVencidas += entry.value;
        }
      }
    });

    summary.saldoLiquido = summary.totalReceitas - summary.totalDespesas;

    res.json(summary);
  } catch (error) {
    console.error('Erro ao calcular resumo financeiro:', error);
    res.status(500).json({
      error: 'Erro ao calcular resumo financeiro'
    });
  }
});

module.exports = router;