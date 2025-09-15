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

// GET /api/publications - Listar publicações
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { source, type, read, acknowledged, priority, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('publications')
      .select(`
        *,
        process:processes(id, number, subject),
        responsible:users!publications_responsible_id_fkey(id, name)
      `, { count: 'exact' })
      .order('date', { ascending: false });

    if (source && source !== 'all') {
      query = query.eq('source', source);
    }
    
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }
    
    if (read === 'true') {
      query = query.eq('read', true);
    } else if (read === 'false') {
      query = query.eq('read', false);
    }
    
    if (acknowledged === 'true') {
      query = query.eq('acknowledged', true);
    } else if (acknowledged === 'false') {
      query = query.eq('acknowledged', false);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: publications, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      publications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar publicações:', error);
    res.status(500).json({
      error: 'Erro ao buscar publicações'
    });
  }
});

// POST /api/publications - Criar publicação
router.post('/', authenticateToken, async (req, res) => {
  try {
    const publicationData = {
      ...req.body,
      created_at: new Date().toISOString()
    };

    const { data: newPublication, error } = await supabase
      .from('publications')
      .insert([publicationData])
      .select(`
        *,
        process:processes(id, number, subject),
        responsible:users!publications_responsible_id_fkey(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(newPublication);
  } catch (error) {
    console.error('Erro ao criar publicação:', error);
    res.status(500).json({
      error: 'Erro ao criar publicação'
    });
  }
});

// PUT /api/publications/:id/acknowledge - Dar ciência na publicação
router.put('/:id/acknowledge', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: updatedPublication, error } = await supabase
      .from('publications')
      .update({
        acknowledged: true,
        read: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: req.user.id
      })
      .eq('id', id)
      .select(`
        *,
        process:processes(id, number, subject),
        responsible:users!publications_responsible_id_fkey(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!updatedPublication) {
      return res.status(404).json({
        error: 'Publicação não encontrada'
      });
    }

    res.json(updatedPublication);
  } catch (error) {
    console.error('Erro ao dar ciência na publicação:', error);
    res.status(500).json({
      error: 'Erro ao dar ciência na publicação'
    });
  }
});

// PUT /api/publications/:id/read - Marcar como lida
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: updatedPublication, error } = await supabase
      .from('publications')
      .update({
        read: true
      })
      .eq('id', id)
      .select(`
        *,
        process:processes(id, number, subject),
        responsible:users!publications_responsible_id_fkey(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!updatedPublication) {
      return res.status(404).json({
        error: 'Publicação não encontrada'
      });
    }

    res.json(updatedPublication);
  } catch (error) {
    console.error('Erro ao marcar publicação como lida:', error);
    res.status(500).json({
      error: 'Erro ao marcar publicação como lida'
    });
  }
});

module.exports = router;