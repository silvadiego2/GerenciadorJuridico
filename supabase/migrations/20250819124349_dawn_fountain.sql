/*
  # Criar tabela de movimentos de processo

  1. Nova Tabela
    - `process_movements`
      - `id` (uuid, primary key)
      - `process_id` (uuid, foreign key para processes)
      - `date` (timestamptz, obrigatório)
      - `description` (text, obrigatório)
      - `type` (text)
      - `read` (boolean, padrão false)
      - `created_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela `process_movements`
    - Política para usuários autenticados lerem movimentos
    - Política para advogados e admins gerenciarem movimentos
*/

CREATE TABLE IF NOT EXISTS process_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id uuid REFERENCES processes(id) ON DELETE CASCADE,
  date timestamptz NOT NULL,
  description text NOT NULL,
  type text CHECK (type IN ('andamento', 'publicacao', 'intimacao', 'citacao')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE process_movements ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados lerem movimentos
CREATE POLICY "Authenticated users can read process movements"
  ON process_movements
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para advogados e admins gerenciarem movimentos
CREATE POLICY "Lawyers and admins can manage process movements"
  ON process_movements
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
CREATE INDEX IF NOT EXISTS idx_process_movements_process_id ON process_movements(process_id);
CREATE INDEX IF NOT EXISTS idx_process_movements_date ON process_movements(date);
CREATE INDEX IF NOT EXISTS idx_process_movements_type ON process_movements(type);
CREATE INDEX IF NOT EXISTS idx_process_movements_read ON process_movements(read);