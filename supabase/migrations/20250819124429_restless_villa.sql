/*
  # Criar tabela de configurações de integração

  1. Nova Tabela
    - `integration_configs`
      - `id` (uuid, primary key)
      - `service` (text, único, obrigatório)
      - `api_key` (text)
      - `username` (text)
      - `password` (text)
      - `certificate_data` (text - Base64 do certificado)
      - `certificate_password` (text)
      - `active` (boolean, padrão false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela `integration_configs`
    - Política RESTRITIVA - apenas admins podem acessar
*/

CREATE TABLE IF NOT EXISTS integration_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text UNIQUE NOT NULL,
  api_key text,
  username text,
  password text,
  certificate_data text,
  certificate_password text,
  active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;

-- Política RESTRITIVA - apenas admins podem acessar configurações de integração
CREATE POLICY "Only admins can access integration configs"
  ON integration_configs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_integration_configs_service ON integration_configs(service);
CREATE INDEX IF NOT EXISTS idx_integration_configs_active ON integration_configs(active);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_integration_configs_updated_at 
  BEFORE UPDATE ON integration_configs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();