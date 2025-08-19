/*
  # Criar tabela de clientes

  1. Nova Tabela
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text, obrigatório)
      - `email` (text, opcional)
      - `phone` (text, opcional)
      - `document` (text, único - CPF/CNPJ)
      - `type` (text, obrigatório - 'fisica' ou 'juridica')
      - `address` (jsonb, para flexibilidade)
      - `status` (text, padrão 'ativo')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela `clients`
    - Política para usuários autenticados lerem clientes
    - Política para advogados e admins gerenciarem clientes
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  document text UNIQUE,
  type text NOT NULL CHECK (type IN ('fisica', 'juridica')),
  address jsonb,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados lerem clientes
CREATE POLICY "Authenticated users can read clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para advogados e admins gerenciarem clientes
CREATE POLICY "Lawyers and admins can manage clients"
  ON clients
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
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_document ON clients(document);
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();