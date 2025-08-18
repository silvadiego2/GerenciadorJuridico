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

// GET /api/documents - Listar documentos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { process_id, client_id, folder_id, search, type, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('documents')
      .select(`
        *,
        process:processes(id, number, subject),
        client:clients(id, name),
        uploaded_by_user:users!documents_uploaded_by_fkey(id, name)
      `)
      .order('created_at', { ascending: false });

    if (process_id) {
      query = query.eq('process_id', process_id);
    }
    
    if (client_id) {
      query = query.eq('client_id', client_id);
    }
    
    if (folder_id) {
      query = query.eq('folder_id', folder_id);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: documents, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({
      error: 'Erro ao buscar documentos'
    });
  }
});

// POST /api/documents - Upload de documento
router.post('/', authenticateToken, async (req, res) => {
  try {
    const documentData = {
      ...req.body,
      uploaded_by: req.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newDocument, error } = await supabase
      .from('documents')
      .insert([documentData])
      .select(`
        *,
        process:processes(id, number, subject),
        client:clients(id, name),
        uploaded_by_user:users!documents_uploaded_by_fkey(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    res.status(500).json({
      error: 'Erro ao criar documento'
    });
  }
});

// GET /api/documents/:id - Buscar documento por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        process:processes(id, number, subject),
        client:clients(id, name),
        uploaded_by_user:users!documents_uploaded_by_fkey(id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !document) {
      return res.status(404).json({
        error: 'Documento não encontrado'
      });
    }

    res.json(document);
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    res.status(500).json({
      error: 'Erro ao buscar documento'
    });
  }
});

module.exports = router;