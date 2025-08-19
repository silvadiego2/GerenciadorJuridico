/*
  # Criar tabela de tarefas

  1. Nova Tabela
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text, obrigatório)
      - `description` (text)
      - `process_id` (uuid, foreign key para processes)
      - `client_id` (uuid, foreign key para clients)
      - `assigned_to` (uuid, foreign key para users)
      - `priority` (text, obrigatório)
      - `status` (text, padrão 'pendente')
      - `due_date` (timestamptz, obrigatório)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela `tasks`
    - Política para usuários lerem suas próprias tarefas
    - Política para advogados e admins gerenciarem tarefas
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  process_id uuid REFERENCES processes(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  priority text NOT NULL CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  due_date timestamptz NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Política para usuários lerem suas próprias tarefas
CREATE POLICY "Users can read their own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

-- Política para advogados e admins gerenciarem todas as tarefas
CREATE POLICY "Lawyers and admins can manage all tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'advogado')
    )
  );

-- Política para estagiários gerenciarem suas próprias tarefas
CREATE POLICY "Interns can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    assigned_to = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'estagiario'
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_process_id ON tasks(process_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();