/*
  # Criar tabela de usuários

  1. Nova Tabela
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, obrigatório)
      - `email` (text, único, obrigatório)
      - `password_hash` (text, obrigatório)
      - `role` (text, padrão 'estagiario')
      - `oab` (text, opcional)
      - `phone` (text, opcional)
      - `avatar` (text, opcional)
      - `last_login` (timestamptz, opcional)
      - `created_at` (timestamptz, padrão now())
      - `updated_at` (timestamptz, padrão now())

  2. Segurança
    - Habilitar RLS na tabela `users`
    - Política para usuários autenticados lerem seus próprios dados
    - Política para admins gerenciarem todos os usuários
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'estagiario' CHECK (role IN ('admin', 'advogado', 'estagiario', 'cliente')),
  oab text,
  phone text,
  avatar text,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para usuários lerem seus próprios dados
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política para admins gerenciarem todos os usuários
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();