/*
  # Criar tabela de processos

  1. Nova Tabela
    - `processes`
      - `id` (uuid, primary key)
      - `number` (text, único, obrigatório)
      - `cnj` (text, único)
      - `client_id` (uuid, foreign key para clients)
      - `subject` (text, obrigatório)
      - `class` (text)
      - `court` (text)
      - `comarca` (text)
      - `phase` (text)
      - `status` (text, padrão 'ativo')
      - `value` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela `processes`
    - Política para usuários autenticados lerem processos
    - Política para advogados e admins gerenciarem processos
*/

CREATE TABLE IF NOT EXISTS processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  cnj text UNIQUE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  subject text NOT NULL,
  class text,
  court text,
  comarca text,
  phase text,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'arquivado', 'baixado')),
  value numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados lerem processos
CREATE POLICY "Authenticated users can read processes"
  ON processes
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para advogados e admins gerenciarem processos
CREATE POLICY "Lawyers and admins can manage processes"
  ON processes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'advogado', 'estagiario')
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_processes_number ON processes(number);
CREATE INDEX IF NOT EXISTS idx_processes_cnj ON processes(cnj);
CREATE INDEX IF NOT EXISTS idx_processes_client_id ON processes(client_id);
CREATE INDEX IF NOT EXISTS idx_processes_status ON processes(status);
CREATE INDEX IF NOT EXISTS idx_processes_subject ON processes USING gin(to_tsvector('portuguese', subject));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_processes_updated_at 
  BEFORE UPDATE ON processes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();