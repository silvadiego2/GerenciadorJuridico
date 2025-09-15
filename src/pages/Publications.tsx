import React, { useState } from 'react';
import { 
  BookOpen, Search, Filter, Eye, CheckCircle, Clock, 
  AlertTriangle, Download, Bell, Calendar, User,
  ExternalLink, Tag, RefreshCw, Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicationsService } from '../lib/api';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications } from '../hooks/useNotifications';
import { useDebounce } from '../hooks/useDebounce';

interface Publication {
  id: string;
  date: string;
  content: string;
  source: 'dje-ba' | 'dou' | 'dje-trt' | 'dje-trf';
  process_id?: string;
  oab_numbers: string[];
  type: 'intimacao' | 'citacao' | 'publicacao' | 'edital' | 'despacho';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  deadline?: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
  read: boolean;
  responsible_id?: string;
  tags: string[];
  created_at: string;
  // Relacionamentos vindos do backend
  process?: {
    id: string;
    number: string;
    subject: string;
  };
  responsible?: {
    id: string;
    name: string;
  };
}

const Publications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<'all' | 'dje-ba' | 'dou' | 'dje-trt' | 'dje-trf'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'intimacao' | 'citacao' | 'publicacao' | 'edital' | 'despacho'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'nao_lida' | 'lida' | 'nao_ciente' | 'ciente'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'baixa' | 'media' | 'alta' | 'urgente'>('all');
  
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Query para buscar publicações
  const { data: publicationsData, isLoading, error: queryError } = useQuery({
    queryKey: ['publications', debouncedSearchTerm, selectedSource, selectedType, selectedStatus, selectedPriority],
    queryFn: () => {
      const params: Record<string, string> = {};
      
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (selectedSource !== 'all') params.source = selectedSource;
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedPriority !== 'all') params.priority = selectedPriority;
      
      // Mapear status para parâmetros do backend
      if (selectedStatus === 'nao_lida') params.read = 'false';
      else if (selectedStatus === 'lida') params.read = 'true';
      else if (selectedStatus === 'nao_ciente') params.acknowledged = 'false';
      else if (selectedStatus === 'ciente') params.acknowledged = 'true';
      
      return publicationsService.getAll(params);
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  const publications = publicationsData?.publications || [];

  // Mutation para dar ciência
  const acknowledgeMutation = useMutation({
    mutationFn: publicationsService.acknowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      success('Sucesso', 'Ciência registrada com sucesso!');
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao dar ciência');
    },
  });

  // Mutation para marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: publicationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] });
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao marcar como lida');
    },
  });

  const handleAcknowledge = (publicationId: string) => {
    acknowledgeMutation.mutate(publicationId);
  };

  const handleMarkAsRead = (publicationId: string) => {
    if (!publications.find(p => p.id === publicationId)?.read) {
      markAsReadMutation.mutate(publicationId);
    }
  };

  const getSourceName = (source: string) => {
    switch (source) {
      case 'dje-ba': return 'DJE-BA';
      case 'dou': return 'DOU';
      case 'dje-trt': return 'DJE-TRT';
      case 'dje-trf': return 'DJE-TRF';
      default: return source.toUpperCase();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'intimacao': return 'bg-orange-100 text-orange-800';
      case 'citacao': return 'bg-blue-100 text-blue-800';
      case 'publicacao': return 'bg-green-100 text-green-800';
      case 'edital': return 'bg-purple-100 text-purple-800';
      case 'despacho': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'bg-red-50 text-red-700 border-red-200';
      case 'alta': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'media': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'baixa': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyStatus = (publication: Publication) => {
    if (!publication.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(publication.deadline);
    
    if (isBefore(deadline, now)) {
      return { type: 'overdue', label: 'Prazo vencido', color: 'text-red-600' };
    } else if (isBefore(deadline, addDays(now, 3))) {
      return { type: 'urgent', label: 'Vence em breve', color: 'text-orange-600' };
    } else {
      return { type: 'normal', label: 'No prazo', color: 'text-green-600' };
    }
  };

  // Calcular estatísticas dinamicamente
  const unreadCount = publications.filter(p => !p.read).length;
  const unacknowledgedCount = publications.filter(p => !p.acknowledged).length;
  const todayCount = publications.filter(p => 
    format(new Date(p.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;

  if (queryError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar publicações: {(queryError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publicações</h1>
          <p className="text-gray-600">Monitoramento de diários oficiais e intimações</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['publications'] })}
            disabled={isLoading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Configurar Alertas</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Não Lidas</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sem Ciência</p>
              <p className="text-2xl font-bold text-orange-600">{unacknowledgedCount}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hoje</p>
              <p className="text-2xl font-bold text-blue-600">{todayCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Mês</p>
              <p className="text-2xl font-bold text-green-600">{publications.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar publicações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as fontes</option>
            <option value="dje-ba">DJE-BA</option>
            <option value="dou">DOU</option>
            <option value="dje-trt">DJE-TRT</option>
            <option value="dje-trf">DJE-TRF</option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="intimacao">Intimação</option>
            <option value="citacao">Citação</option>
            <option value="publicacao">Publicação</option>
            <option value="edital">Edital</option>
            <option value="despacho">Despacho</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="nao_lida">Não lidas</option>
            <option value="lida">Lidas</option>
            <option value="nao_ciente">Sem ciência</option>
            <option value="ciente">Com ciência</option>
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </div>

      {/* Lista de Publicações */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'Carregando...' : `${publications.length} publicação${publications.length !== 1 ? 'ões' : ''} encontrada${publications.length !== 1 ? 's' : ''}`}
            </h2>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Carregando publicações...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {publications.map((publication) => {
              const urgency = getUrgencyStatus(publication);
              return (
                <div 
                  key={publication.id} 
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !publication.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleMarkAsRead(publication.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(publication.type)}`}>
                            {publication.type.charAt(0).toUpperCase() + publication.type.slice(1)}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {getSourceName(publication.source)}
                          </span>
                          <span className={`px-2 py-1 rounded-md border text-xs ${getPriorityColor(publication.priority)}`}>
                            {publication.priority.charAt(0).toUpperCase() + publication.priority.slice(1)}
                          </span>
                          {!publication.read && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              Não lida
                            </span>
                          )}
                          {!publication.acknowledged && (
                            <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                              Sem ciência
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-900 mb-3 leading-relaxed">
                          {publication.content}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(publication.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </div>
                          {publication.process && (
                            <span className="font-mono">{publication.process.number}</span>
                          )}
                          {publication.responsible && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{publication.responsible.name}</span>
                            </div>
                          )}
                        </div>
                        
                        {publication.deadline && urgency && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Prazo: {format(new Date(publication.deadline), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                            <span className={`text-sm font-medium ${urgency.color}`}>
                              ({urgency.label})
                            </span>
                          </div>
                        )}
                        
                        {publication.tags && publication.tags.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <div className="flex space-x-1">
                              {publication.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!publication.acknowledged && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(publication.id);
                          }}
                          disabled={acknowledgeMutation.isPending}
                          className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                        >
                          {acknowledgeMutation.isPending ? 'Dando ciência...' : 'Dar Ciência'}
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {publications.length === 0 && !isLoading && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Nenhuma publicação encontrada</p>
                <p className="text-gray-400 text-sm mt-2">
                  As publicações aparecerão aqui quando forem capturadas automaticamente dos diários oficiais
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Publications;