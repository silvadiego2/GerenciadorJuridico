export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'advogado' | 'estagiario' | 'cliente';
  oab?: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string; // CPF/CNPJ
  type: 'fisica' | 'juridica';
  address?: Address;
  status: 'ativo' | 'inativo';
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Process {
  id: string;
  number: string;
  cnj: string;
  clientId?: string;
  client_id?: string;
  client: Client;
  subject: string;
  class: string;
  court: string;
  comarca: string;
  phase: string;
  status: 'ativo' | 'suspenso' | 'arquivado' | 'baixado';
  value?: number;
  createdAt: Date;
  updatedAt: Date;
  movements: ProcessMovement[];
  tasks: Task[];
  documents: Document[];
}

export interface ProcessMovement {
  id: string;
  processId: string;
  date: Date;
  description: string;
  type: 'andamento' | 'publicacao' | 'intimacao' | 'citacao';
  read: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  processId?: string;
  clientId?: string;
  assignedTo: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  dueDate: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Relacionamentos vindos do backend
  process?: {
    id: string;
    number: string;
    subject: string;
  };
  client?: {
    id: string;
    name: string;
  };
  assigned_user?: {
    id: string;
    name: string;
  };
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  processId?: string;
  clientId?: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface Financial {
  id: string;
  type: 'honorario' | 'despesa' | 'reembolso';
  description: string;
  value: number;
  status: 'pendente' | 'pago' | 'vencido';
  dueDate: Date;
  paidAt?: Date;
  processId?: string;
  clientId: string;
  createdAt: Date;
}

export interface Publication {
  id: string;
  date: Date;
  content: string;
  source: 'dje' | 'dou' | 'tribunal';
  processId?: string;
  read: boolean;
  acknowledged: boolean;
}

export interface Dashboard {
  totalProcesses: number;
  activeProcesses: number;
  overdueTasks: number;
  pendingPublications: number;
  monthlyRevenue: number;
  clientsCount: number;
  processesByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  revenueByMonth: { month: string; value: number }[];
}