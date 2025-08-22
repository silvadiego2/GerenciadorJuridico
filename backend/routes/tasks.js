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

// GET /api/tasks - Listar tarefas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority, assigned_to, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        process:processes(id, number, subject),
        client:clients(id, name),
        assigned_user:users!tasks_assigned_to_fkey(id, name)
      `)
      .order('due_date', { ascending: true });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }
    
    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: tasks, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({
      error: 'Erro ao buscar tarefas'
    });
  }
});

// POST /api/tasks - Criar tarefa
router.post('/', authenticateToken, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select(`
        *,
        process:processes(id, number, subject),
        client:clients(id, name),
        assigned_user:users!tasks_assigned_to_fkey(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({
      error: 'Erro ao criar tarefa'
    });
  }
});

// PUT /api/tasks/:id - Atualizar tarefa
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // Se está marcando como concluída, adicionar data de conclusão
    if (req.body.status === 'concluida' && !req.body.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        process:processes(id, number, subject),
        client:clients(id, name),
        assigned_user:users!tasks_assigned_to_fkey(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!updatedTask) {
      return res.status(404).json({
        error: 'Tarefa não encontrada'
      });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({
      error: 'Erro ao atualizar tarefa'
    });
  }
});

// DELETE /api/tasks/:id - Deletar tarefa
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      message: 'Tarefa deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({
      error: 'Erro ao deletar tarefa'
    });
  }
});

module.exports = router;