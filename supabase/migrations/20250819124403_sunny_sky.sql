/*
  # Criar tabela de documentos

  1. Nova Tabela
    - `documents`
      - `id` (uuid, primary key)
      - `name` (text, obrigatório)
      - `type` (text, obrigatório - MIME type)
      - `size` (bigint - tamanho em bytes)
      - `url` (text, obrigatório - URL do arquivo)
      - `process_id` (uuid, foreign key para processes)
      - `client_id` (uuid, foreign key para clients)
      - `folder_id` (uuid, para organização)
      - `uploaded_by` (uuid, foreign key para users)
      - `version` (integer, padrão 1)
      - `tags` (text array)
      - `is_shared` (boolean, padrão false)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela `documents`
    - Política para usuários autenticados lerem documentos
    - Política para advogados e admins gerenciarem documentos
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  size bigint,
  url text NOT NULL,
  process_id uuid REFERENCES processes(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  folder_id uuid,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  version integer DEFAULT 1,
  tags text[],
  is_shared boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados lerem documentos
CREATE POLICY "Authenticated users can read documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para advogados e admins gerenciarem documentos
CREATE POLICY "Lawyers and admins can manage documents"
  ON documents
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
CREATE INDEX IF NOT EXISTS idx_documents_name ON documents USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_documents_process_id ON documents(process_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING gin(tags);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();