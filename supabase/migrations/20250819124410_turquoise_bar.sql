/*
  # Criar tabela de entradas financeiras

  1. Nova Tabela
    - `financial_entries`
      - `id` (uuid, primary key)
      - `type` (text, obrigatório)
      - `category` (text)
      - `description` (text, obrigatório)
      - `value` (numeric, obrigatório)
      - `status` (text, padrão 'pendente')
      - `due_date` (timestamptz, obrigatório)
      - `paid_at` (timestamptz)
      - `process_id` (uuid, foreign key para processes)
      - `client_id` (uuid, foreign key para clients)
      - `responsible_id` (uuid, foreign key para users)
      - `payment_method` (text)
      - `installments` (integer)
      - `current_installment` (integer)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela `financial_entries`
    - Política para usuários autenticados lerem entradas financeiras
    - Política para advogados e admins gerenciarem entradas
*/

CREATE TABLE IF NOT EXISTS financial_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('honorario', 'despesa', 'receita', 'reembolso')),
  category text,
  description text NOT NULL,
  value numeric NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
  due_date timestamptz NOT NULL,
  paid_at timestamptz,
  process_id uuid REFERENCES processes(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  responsible_id uuid REFERENCES users(id) ON DELETE SET NULL,
  payment_method text,
  installments integer,
  current_installment integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;

-- Política para usuários com permissão financeira lerem entradas
CREATE POLICY "Users with financial permission can read entries"
  ON financial_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'advogado')
    )
  );

-- Política para advogados e admins gerenciarem entradas financeiras
CREATE POLICY "Lawyers and admins can manage financial entries"
  ON financial_entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'advogado')
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_financial_entries_type ON financial_entries(type);
CREATE INDEX IF NOT EXISTS idx_financial_entries_status ON financial_entries(status);
CREATE INDEX IF NOT EXISTS idx_financial_entries_due_date ON financial_entries(due_date);
CREATE INDEX IF NOT EXISTS idx_financial_entries_client_id ON financial_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_process_id ON financial_entries(process_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_responsible_id ON financial_entries(responsible_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_financial_entries_updated_at 
  BEFORE UPDATE ON financial_entries 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();