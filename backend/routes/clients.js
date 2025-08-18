const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Inicializar cliente Supabase
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

// GET /api/clients - Listar clientes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, type, status, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,document.ilike.%${search}%`);
    }
    
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: clients, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      clients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({
      error: 'Erro ao buscar clientes'
    });
  }
});

// POST /api/clients - Criar cliente
router.post('/', authenticateToken, async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newClient, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(newClient);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      error: 'Erro ao criar cliente'
    });
  }
});

// GET /api/clients/:id - Buscar cliente por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !client) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    res.json(client);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      error: 'Erro ao buscar cliente'
    });
  }
});

// PUT /api/clients/:id - Atualizar cliente
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    if (!updatedClient) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    res.json(updatedClient);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      error: 'Erro ao atualizar cliente'
    });
  }
});

// DELETE /api/clients/:id - Deletar cliente
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      message: 'Cliente deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({
      error: 'Erro ao deletar cliente'
    });
  }
});

module.exports = router;