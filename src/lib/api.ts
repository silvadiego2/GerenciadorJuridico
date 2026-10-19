import { supabase } from './supabaseClient';
import { Process, Client, Task } from '../types';

// ==========================================
// 1. CLIENTES (clientsService)
// ==========================================
export const clientsService = {
  async getAll(params?: Record<string, string>): Promise<{ clients: Client[]; total: number }> {
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' });

    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,document.ilike.%${params.search}%`);
    }

    if (params?.type && params.type !== 'all') {
      query = query.eq('type', params.type);
    }

    query = query.order('name', { ascending: true });

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    const clients: Client[] = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      document: c.document,
      type: c.type || 'individual',
      address: c.address,
      notes: c.notes,
      createdAt: c.created_at,
      updatedAt: c.updated_at || c.created_at,
    }));

    return { clients, total: count || clients.length };
  },

  async getById(id: string): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async create(data: Partial<Client>): Promise<Client> {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      document: data.document,
      type: data.type || 'individual',
      address: data.address,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: created, error } = await supabase
      .from('clients')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return created;
  },

  async update(id: string, data: Partial<Client>): Promise<Client> {
    const payload = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: updated, error } = await supabase
      .from('clients')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
};

// ==========================================
// 2. PROCESSOS (processesService)
// ==========================================
export const processesService = {
  async getAll(params?: { search?: string; status?: string }): Promise<{ processes: Process[]; total: number }> {
    let query = supabase
      .from('processes')
      .select('*, client:clients(id, name, email, phone)', { count: 'exact' });

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }

    if (params?.search) {
      query = query.or(`number.ilike.%${params.search}%,subject.ilike.%${params.search}%,title.ilike.%${params.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    const processes: Process[] = (data || []).map((p: any) => ({
      id: p.id,
      number: p.number,
      subject: p.subject || p.title || 'Sem assunto',
      status: p.status || 'ativo',
      phase: p.phase || 'conhecimento',
      court: p.court || '',
      class: p.class || '',
      value: p.value || 0,
      createdAt: p.created_at,
      updatedAt: p.updated_at || p.created_at,
      client: p.client || null,
      clientId: p.client_id || null,
    }));

    return { processes, total: count || processes.length };
  },

  async getById(id: string): Promise<Process> {
    const { data, error } = await supabase
      .from('processes')
      .select('*, client:clients(id, name, email, phone)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async create(data: Partial<Process>): Promise<Process> {
    const payload = {
      number: data.number,
      title: data.subject || data.number,
      subject: data.subject,
      status: data.status || 'ativo',
      phase: data.phase,
      court: data.court,
      class: data.class,
      value: data.value,
      client_id: data.clientId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: created, error } = await supabase
      .from('processes')
      .insert([payload])
      .select('*, client:clients(id, name, email, phone)')
      .single();

    if (error) throw new Error(error.message);
    return created;
  },

  async update(id: string, data: Partial<Process>): Promise<Process> {
    const payload = {
      number: data.number,
      subject: data.subject,
      status: data.status,
      phase: data.phase,
      court: data.court,
      class: data.class,
      value: data.value,
      client_id: data.clientId,
      updated_at: new Date().toISOString()
    };

    const { data: updated, error } = await supabase
      .from('processes')
      .update(payload)
      .eq('id', id)
      .select('*, client:clients(id, name, email, phone)')
      .single();

    if (error) throw new Error(error.message);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('processes')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
};

// ==========================================
// 3. TAREFAS (tasksService)
// ==========================================
export const tasksService = {
  async getAll(params?: Record<string, string>): Promise<{ tasks: Task[]; total: number }> {
    let query = supabase
      .from('tasks')
      .select('*, process:processes(id, number, title), assigned_user:users(id, name)', { count: 'exact' });

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }

    if (params?.priority && params.priority !== 'all') {
      query = query.eq('priority', params.priority);
    }

    query = query.order('due_date', { ascending: true });

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    const tasks: Task[] = (data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date,
      processId: t.process_id,
      assignedTo: t.assigned_to,
      createdAt: t.created_at,
      updatedAt: t.updated_at || t.created_at,
      process: t.process || null,
      assignedUser: t.assigned_user || null,
    }));

    return { tasks, total: count || tasks.length };
  },

  async create(data: any): Promise<Task> {
    const payload = {
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      due_date: data.dueDate,
      process_id: data.processId || null,
      assigned_to: data.assignedTo || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: created, error } = await supabase
      .from('tasks')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return created;
  },

  async update(id: string, data: any): Promise<Task> {
    const payload = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: updated, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
};

// ==========================================
// 4. DOCUMENTOS (documentsService)
// ==========================================
export const documentsService = {
  async getAll(params?: Record<string, string>): Promise<{ documents: any[] }> {
    let query = supabase.from('documents').select('*');
    if (params?.processId) {
      query = query.eq('process_id', params.processId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { documents: data || [] };
  },

  async getById(id: string): Promise<any> {
    const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data;
  },

  async create(data: any): Promise<any> {
    const { data: created, error } = await supabase.from('documents').insert([data]).select().single();
    if (error) throw new Error(error.message);
    return created;
  },

  async update(id: string, data: any): Promise<any> {
    const { data: updated, error } = await supabase.from('documents').update(data).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
};

// ==========================================
// 5. FINANCEIRO (financialService)
// ==========================================
export const financialService = {
  async getAll(params?: Record<string, string>): Promise<{ entries: any[] }> {
    let query = supabase.from('financial_entries').select('*');
    if (params?.type && params.type !== 'all') {
      query = query.eq('type', params.type);
    }
    const { data, error } = await query.order('due_date', { ascending: false });
    if (error) throw new Error(error.message);
    return { entries: data || [] };
  },

  async getSummary(): Promise<any> {
    const { data, error } = await supabase.from('financial_entries').select('type, amount, status');
    if (error) throw new Error(error.message);

    const entries = data || [];
    let totalReceitas = 0;
    let totalDespesas = 0;

    entries.forEach((e: any) => {
      const val = Number(e.amount) || 0;
      if (e.type === 'income') totalReceitas += val;
      if (e.type === 'expense') totalDespesas += val;
    });

    return {
      totalReceitas,
      totalDespesas,
      saldoLiquido: totalReceitas - totalDespesas,
      honorariosPendentes: 0,
      despesasVencidas: 0
    };
  },

  async create(data: any): Promise<any> {
    const { data: created, error } = await supabase.from('financial_entries').insert([data]).select().single();
    if (error) throw new Error(error.message);
    return created;
  },

  async update(id: string, data: any): Promise<any> {
    const { data: updated, error } = await supabase.from('financial_entries').update(data).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('financial_entries').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
};

// ==========================================
// 6. PUBLICAÇÕES (publicationsService)
// ==========================================
export const publicationsService = {
  async getAll(params?: Record<string, string>): Promise<{ publications: any[] }> {
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .order('publication_date', { ascending: false });
    if (error) throw new Error(error.message);
    return { publications: data || [] };
  },

  async acknowledge(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('publications')
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async markAsRead(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('publications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async create(data: any): Promise<any> {
    const { data: created, error } = await supabase.from('publications').insert([data]).select().single();
    if (error) throw new Error(error.message);
    return created;
  }
};

// ==========================================
// 7. INTEGRAÇÕES (Serverless Vercel)
// ==========================================
export const integrationsService = {
  async searchDataJud(data: { numeroProcesso: string; tribunal: string }) {
    const response = await fetch('/api/search-oab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getTJBATransparency(data: { type: 'indicators' | 'metas' }) {
    return { status: 'success', data: [] };
  },

  async getConfigs() {
    const { data } = await supabase.from('settings').select('*').eq('key', 'integrations').single();
    return data?.value || {};
  },

  async saveConfig(data: any) {
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'integrations', value: data, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { success: true };
  }
};

// ==========================================
// 8. DASHBOARD (dashboardService)
// ==========================================
export const dashboardService = {
  async getSummary(): Promise<any> {
    const [procRes, clientRes, taskRes] = await Promise.all([
      supabase.from('processes').select('id', { count: 'exact', head: true }),
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('id', { count: 'exact', head: true })
    ]);

    return {
      totalProcesses: procRes.count || 0,
      totalClients: clientRes.count || 0,
      totalTasks: taskRes.count || 0,
      activeProcesses: procRes.count || 0,
      pendingTasks: taskRes.count || 0
    };
  },

  async getStats(period?: string): Promise<any> {
    return this.getSummary();
  }
};

// ==========================================
// 9. UTILIZADORES (usersService)
// ==========================================
export const usersService = {
  async getAll(): Promise<{ users: any[] }> {
    const { data, error } = await supabase.from('users').select('*').order('name');
    if (error) throw new Error(error.message);
    return { users: data || [] };
  },

  async getById(id: string): Promise<any> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, data: any): Promise<any> {
    const { data: updated, error } = await supabase.from('users').update(data).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
};

// ==========================================
// 10. RELATÓRIOS (reportsService)
// ==========================================
export const reportsService = {
  async getData(reportType: string, dateRange: string): Promise<any> {
    const summary = await dashboardService.getSummary();
    return {
      overview: {
        totalProcesses: summary.totalProcesses,
        totalClients: summary.totalClients,
        totalRevenue: 0,
        totalTasks: summary.totalTasks,
        completedTasks: 0,
        overdueTasks: 0,
        pendingPublications: 0
      },
      processesByStatus: [],
      processesByMonth: [],
      tasksByPriority: [],
      productivityByUser: [],
      clientsByType: [],
      expensesByCategory: [],
      deadlinesByUrgency: [],
      revenueByMonth: []
    };
  },

  async exportPDF(reportType: string, dateRange: string): Promise<Blob> {
    return new Blob(['Relatório gerado em PDF'], { type: 'application/pdf' });
  }
};
