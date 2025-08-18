const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken, requireRole } = require('../middleware/auth');

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

// GET /api/users - Listar usuários (apenas admin)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, oab, phone, avatar, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      error: 'Erro ao buscar usuários'
    });
  }
});

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Usuários só podem ver seus próprios dados, exceto admins
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, oab, phone, avatar, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: 'Erro ao buscar usuário'
    });
  }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const { name, email, oab, phone, role } = req.body;

    // Usuários só podem editar seus próprios dados, exceto admins
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Apenas admins podem alterar roles
    const updateData = { name, email, oab, phone, updated_at: new Date().toISOString() };
    if (currentUser.role === 'admin' && role) {
      updateData.role = role;
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, role, oab, phone, avatar, created_at, updated_at')
      .single();

    if (error) {
      throw error;
    }

    if (!updatedUser) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      error: 'Erro ao atualizar usuário'
    });
  }
});

// DELETE /api/users/:id - Deletar usuário (apenas admin)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      error: 'Erro ao deletar usuário'
    });
  }
});

module.exports = router;