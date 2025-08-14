// Constantes do sistema
export const APP_CONFIG = {
  name: 'LegalTech',
  version: '1.0.0',
  description: 'Sistema de Gestão Jurídica Integrada',
  author: 'LegalTech Solutions'
};

export const API_ENDPOINTS = {
  datajud: 'https://api-publica.datajud.cnj.jus.br/api_publica_',
  tjba: 'https://api.tjba.jus.br/v1',
  transparency: 'https://transparencia.tjba.jus.br/api/v1'
};

export const STORAGE_KEYS = {
  auth: 'auth_user',
  settings: 'app_settings',
  preferences: 'user_preferences'
};

export const ROUTES = {
  dashboard: '/',
  clients: '/clientes',
  processes: '/processos',
  tasks: '/tarefas',
  documents: '/documentos',
  financial: '/financeiro',
  publications: '/publicacoes',
  reports: '/relatorios',
  integrations: '/integracoes',
  users: '/usuarios',
  settings: '/configuracoes'
};

export const USER_ROLES = {
  admin: 'admin',
  lawyer: 'advogado',
  intern: 'estagiario',
  client: 'cliente'
} as const;

export const PROCESS_STATUS = {
  active: 'ativo',
  suspended: 'suspenso',
  archived: 'arquivado',
  closed: 'baixado'
} as const;

export const TASK_PRIORITIES = {
  low: 'baixa',
  medium: 'media',
  high: 'alta',
  urgent: 'urgente'
} as const;

export const DOCUMENT_TYPES = {
  pdf: 'application/pdf',
  word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  image: 'image/*'
} as const;