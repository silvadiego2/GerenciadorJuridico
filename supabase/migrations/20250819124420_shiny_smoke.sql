/*
  # Criar tabela de publicações

  1. Nova Tabela
    - `publications`
      - `id` (uuid, primary key)
      - `date` (timestamptz, obrigatório)
      - `content` (text, obrigatório)
      - `source` (text, obrigatório)
      - `process_id` (uuid, foreign key para processes)
      - `oab_numbers` (text array)
      - `type` (text, obrigatório)
      - `priority` (text, obrigatório)
      - `deadline` (timestamptz)
      - `acknowledged` (boolean, padrão false)
      - `acknowledged_at` (timestamptz)
      - `acknowledged_by` (uuid, foreign key para users)
      - `read` (boolean, padrão false)
      - `responsible_id` (uuid, foreign key para users)
      - `tags` (text array)
      - `created_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela `publications`
    - Política para usuários autenticados lerem publicações
    - Política para advogados e admins gerenciarem publicações
*/

CREATE TABLE IF NOT EXISTS publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz NOT NULL,
  content text NOT NULL,
  source text NOT NULL CHECK (source IN ('dje-ba', 'dou', 'dje-trt', 'dje-trf')),
  process_id uuid REFERENCES processes(id) ON DELETE SET NULL,
  oab_numbers text[],
  type text NOT NULL CHECK (type IN ('intimacao', 'citacao', 'publicacao', 'edital', 'despacho')),
  priority text NOT NULL CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  deadline timestamptz,
  acknowledged boolean DEFAULT false,
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES users(id) ON DELETE SET NULL,
  read boolean DEFAULT false,
  responsible_id uuid REFERENCES users(id) ON DELETE SET NULL,
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados lerem publicações
CREATE POLICY "Authenticated users can read publications"
  ON publications
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para advogados e admins gerenciarem publicações
CREATE POLICY "Lawyers and admins can manage publications"
  ON publications
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
CREATE INDEX IF NOT EXISTS idx_publications_date ON publications(date);
CREATE INDEX IF NOT EXISTS idx_publications_source ON publications(source);
CREATE INDEX IF NOT EXISTS idx_publications_type ON publications(type);
CREATE INDEX IF NOT EXISTS idx_publications_priority ON publications(priority);
CREATE INDEX IF NOT EXISTS idx_publications_process_id ON publications(process_id);
CREATE INDEX IF NOT EXISTS idx_publications_acknowledged ON publications(acknowledged);
CREATE INDEX IF NOT EXISTS idx_publications_read ON publications(read);
CREATE INDEX IF NOT EXISTS idx_publications_content ON publications USING gin(to_tsvector('portuguese', content));
CREATE INDEX IF NOT EXISTS idx_publications_oab_numbers ON publications USING gin(oab_numbers);
CREATE INDEX IF NOT EXISTS idx_publications_tags ON publications USING gin(tags);