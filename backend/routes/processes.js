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

// GET /api/processes - Listar processos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('processes')
      .select(`
        *,
        client:clients(id, name, email, document, type)
      `)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`number.ilike.%${search}%,subject.ilike.%${search}%`);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: processes, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      processes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar processos:', error);
    res.status(500).json({
      error: 'Erro ao buscar processos'
    });
  }
});

// POST /api/processes - Criar processo
router.post('/', authenticateToken, async (req, res) => {
  try {
    const processData = {
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newProcess, error } = await supabase
      .from('processes')
      .insert([processData])
      .select(`
        *,
        client:clients(id, name, email, document, type)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(newProcess);
  } catch (error) {
    console.error('Erro ao criar processo:', error);
    res.status(500).json({
      error: 'Erro ao criar processo'
    });
  }
});

// GET /api/processes/:id - Buscar processo por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: process, error } = await supabase
      .from('processes')
      .select(`
        *,
        client:clients(id, name, email, document, type),
        movements:process_movements(*),
        tasks:tasks(*),
        documents:documents(*)
      `)
      .eq('id', id)
      .single();

    if (error || !process) {
      return res.status(404).json({
        error: 'Processo não encontrado'
      });
    }

    res.json(process);
  } catch (error) {
    console.error('Erro ao buscar processo:', error);
    res.status(500).json({
      error: 'Erro ao buscar processo'
    });
  }
});

// PUT /api/processes/:id - Atualizar processo
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: updatedProcess, error } = await supabase
      .from('processes')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        client:clients(id, name, email, document, type)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!updatedProcess) {
      return res.status(404).json({
        error: 'Processo não encontrado'
      });
    }

    res.json(updatedProcess);
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    res.status(500).json({
      error: 'Erro ao atualizar processo'
    });
  }
});

module.exports = router;

// DELETE /api/processes/:id - Deletar processo
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('processes')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      message: 'Processo deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar processo:', error);
    res.status(500).json({
      error: 'Erro ao deletar processo'
    });
  }
});

module.exports = router;