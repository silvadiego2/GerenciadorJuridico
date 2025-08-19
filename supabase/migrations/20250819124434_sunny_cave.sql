/*
  # Inserir dados de demonstração

  1. Usuários de demonstração
    - Admin, Advogado, Estagiário, Cliente

  2. Clientes de exemplo
    - Pessoa física e jurídica

  3. Processos de exemplo
    - Com diferentes status e fases

  4. Tarefas de exemplo
    - Com diferentes prioridades e status

  5. Configurações de integração básicas
*/

-- Inserir usuários de demonstração (senhas: demo123)
-- Hash bcrypt para 'demo123': $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIf6

INSERT INTO users (id, name, email, password_hash, role, oab, phone) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Dr. João Silva', 'joao@escritorio.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIf6', 'advogado', 'BA 12345', '(71) 99999-9999'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Maria Santos', 'maria@escritorio.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIf6', 'estagiario', NULL, '(71) 88888-8888'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Carlos Administrador', 'admin@escritorio.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIf6', 'admin', NULL, '(71) 77777-7777'),
  ('550e8400-e29b-41d4-a716-446655440004', 'João da Silva Santos', 'cliente@teste.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIf6', 'cliente', NULL, '(71) 66666-6666')
ON CONFLICT (email) DO NOTHING;

-- Inserir clientes de demonstração
INSERT INTO clients (id, name, email, phone, document, type, address, status) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'João da Silva Santos', 'joao.santos@email.com', '(71) 99999-1234', '123.456.789-00', 'fisica', 
   '{"street": "Rua das Flores", "number": "123", "neighborhood": "Centro", "city": "Salvador", "state": "BA", "zipCode": "40000-000"}', 'ativo'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Empresa ABC Ltda', 'contato@empresaabc.com', '(71) 3333-4444', '12.345.678/0001-90', 'juridica',
   '{"street": "Av. Tancredo Neves", "number": "2227", "complement": "Sala 1001", "neighborhood": "Caminho das Árvores", "city": "Salvador", "state": "BA", "zipCode": "41820-021"}', 'ativo')
ON CONFLICT (document) DO NOTHING;

-- Inserir processos de demonstração
INSERT INTO processes (id, number, cnj, client_id, subject, class, court, comarca, phase, status, value) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '1001234-56.2024.8.05.0001', '1001234-56.2024.8.05.0001', '660e8400-e29b-41d4-a716-446655440001', 'Ação de Cobrança', 'Procedimento Comum', '1ª Vara Cível de Salvador', 'Salvador', 'Conhecimento', 'ativo', 50000),
  ('770e8400-e29b-41d4-a716-446655440002', '2002345-67.2024.8.05.0002', '2002345-67.2024.8.05.0002', '660e8400-e29b-41d4-a716-446655440002', 'Ação Trabalhista', 'Rito Ordinário', '3ª Vara do Trabalho de Salvador', 'Salvador', 'Execução', 'ativo', 75000)
ON CONFLICT (number) DO NOTHING;

-- Inserir movimentos de processo
INSERT INTO process_movements (process_id, date, description, type, read) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '2024-12-10 14:30:00+00', 'Juntada de petição inicial', 'andamento', false),
  ('770e8400-e29b-41d4-a716-446655440001', '2024-12-08 10:15:00+00', 'Citação expedida para o réu', 'citacao', true);

-- Inserir tarefas de demonstração
INSERT INTO tasks (title, description, process_id, assigned_to, priority, status, due_date) VALUES
  ('Apresentar contestação', 'Prazo para contestação vence em 15 dias', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'alta', 'pendente', '2024-12-25 23:59:59+00'),
  ('Agendar audiência', 'Entrar em contato com o cliente para agendar horário', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'media', 'em_andamento', '2024-12-20 17:00:00+00');

-- Inserir entradas financeiras de demonstração
INSERT INTO financial_entries (type, category, description, value, status, due_date, paid_at, process_id, client_id, responsible_id) VALUES
  ('honorario', 'Honorários Contratuais', 'Honorários contratuais - Ação de Cobrança', 15000, 'pago', '2024-12-01 23:59:59+00', '2024-12-01 10:00:00+00', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
  ('despesa', 'Custas Processuais', 'Custas iniciais - TJ-BA', 500, 'pendente', '2024-12-30 23:59:59+00', NULL, '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001');

-- Inserir publicações de demonstração
INSERT INTO publications (date, content, source, process_id, oab_numbers, type, priority, deadline, acknowledged, read, responsible_id, tags) VALUES
  ('2024-12-10 08:30:00+00', 'Intimação para apresentação de documentos no prazo de 10 dias', 'dje-ba', '770e8400-e29b-41d4-a716-446655440001', ARRAY['BA 12345'], 'intimacao', 'alta', '2024-12-20 23:59:59+00', false, false, '550e8400-e29b-41d4-a716-446655440001', ARRAY['documentos', 'prazo']),
  ('2024-12-08 09:15:00+00', 'Despacho determinando citação do réu', 'dje-ba', '770e8400-e29b-41d4-a716-446655440001', ARRAY['BA 12345'], 'despacho', 'media', NULL, true, true, '550e8400-e29b-41d4-a716-446655440001', ARRAY['citação', 'despacho']);

-- Inserir configurações de integração básicas (vazias, para serem configuradas pelo admin)
INSERT INTO integration_configs (service, active) VALUES
  ('datajud', false),
  ('pje', false),
  ('tjba_transparency', true)
ON CONFLICT (service) DO NOTHING;