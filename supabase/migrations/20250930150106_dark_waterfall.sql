/*
  # Inserir documentos de demonstração

  1. Documentos de exemplo
    - PDFs vinculados a processos
    - Documentos de clientes
    - Diferentes tipos e tamanhos

  2. Dados realistas
    - Nomes de arquivos jurídicos
    - Tags relevantes
    - Relacionamentos com processos e clientes existentes
*/

-- Inserir documentos de demonstração
INSERT INTO documents (
  id, 
  name, 
  type, 
  size, 
  url, 
  process_id, 
  client_id, 
  uploaded_by, 
  version, 
  tags, 
  is_shared, 
  description,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    'Petição Inicial - Ação de Cobrança.pdf',
    'application/pdf',
    1024000,
    '/documents/peticao-inicial-cobranca.pdf',
    '770e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    1,
    ARRAY['petição', 'inicial', 'cobrança'],
    false,
    'Petição inicial da ação de cobrança contra João da Silva Santos',
    '2024-12-01 10:00:00+00',
    '2024-12-01 10:00:00+00'
  ),
  (
    gen_random_uuid(),
    'Procuração - João Santos.pdf',
    'application/pdf',
    512000,
    '/documents/procuracao-joao-santos.pdf',
    NULL,
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    1,
    ARRAY['procuração', 'representação'],
    false,
    'Procuração outorgada por João da Silva Santos',
    '2024-12-05 14:30:00+00',
    '2024-12-05 14:30:00+00'
  ),
  (
    gen_random_uuid(),
    'Contrato Social - Empresa ABC.pdf',
    'application/pdf',
    2048000,
    '/documents/contrato-social-abc.pdf',
    NULL,
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    2,
    ARRAY['contrato', 'social', 'empresa'],
    true,
    'Contrato social atualizado da Empresa ABC Ltda',
    '2024-11-28 09:15:00+00',
    '2024-12-02 16:45:00+00'
  ),
  (
    gen_random_uuid(),
    'Contestação - Processo Trabalhista.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    756000,
    '/documents/contestacao-trabalhista.docx',
    '770e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    1,
    ARRAY['contestação', 'trabalhista', 'defesa'],
    false,
    'Contestação apresentada no processo trabalhista',
    '2024-12-08 11:20:00+00',
    '2024-12-08 11:20:00+00'
  ),
  (
    gen_random_uuid(),
    'Comprovante de Pagamento - Custas.jpg',
    'image/jpeg',
    345000,
    '/documents/comprovante-custas.jpg',
    '770e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    1,
    ARRAY['comprovante', 'pagamento', 'custas'],
    false,
    'Comprovante de pagamento das custas processuais',
    '2024-12-09 15:45:00+00',
    '2024-12-09 15:45:00+00'
  ),
  (
    gen_random_uuid(),
    'Relatório Pericial - Avaliação Imóvel.pdf',
    'application/pdf',
    3200000,
    '/documents/relatorio-pericial.pdf',
    '770e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    1,
    ARRAY['perícia', 'avaliação', 'imóvel'],
    true,
    'Relatório pericial de avaliação do imóvel objeto da ação',
    '2024-12-07 13:30:00+00',
    '2024-12-07 13:30:00+00'
  )
ON CONFLICT (id) DO NOTHING;