import React, { useState } from 'react';
import { 
  BookOpen, Search, Filter, Eye, CheckCircle, Clock, 
  AlertTriangle, Download, Bell, Calendar, User,
  ExternalLink, Tag, RefreshCw
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Publication {
  id: string;
  date: Date;
  content: string;
  source: 'dje-ba' | 'dou' | 'dje-trt' | 'dje-trf';
  processNumber?: string;
  processId?: string;
  oabNumbers: string[];
  type: 'intimacao' | 'citacao' | 'publicacao' | 'edital' | 'despacho';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  deadline?: Date;
  acknowledged: boolean;
  read: boolean;
  responsibleId?: string;
  responsibleName?: string;
  tags: string[];
  clientName?: string;
  createdAt: Date;
}

const Publications: React.FC = () => {
  const [publications] = useState<Publication[]>([
    {
      id: '1',
      date: new Date('2024-12-10'),
      content: 'INTIMAÇÃO - Processo nº 1001234-56.2024.8.05.0001 - Fica a parte autora, por meio de seu advogado Dr. João Silva (OAB/BA 12345), intimada para apresentar documentos complementares no prazo de 15 (quinze) dias, sob pena de preclusão.',
      source: 'dje-ba',
      processNumber: '1001234-56.2024.8.05.0001',
      processId: '1',
      oabNumbers: ['BA 12345'],
      type: 'intimacao',
      priority: 'alta',
      deadline: addDays(new Date('2024-12-10'), 15),
      acknowledged: false,
      read: false,
      responsibleId: '1',
      responsibleName: 'Dr. João Silva',
      tags: ['documentos', 'prazo', 'preclusão'],
      clientName: 'João da Silva Santos',
      createdAt: new Date('2024-12-10T08:30:00'),
    },
    {
      id: '2',
      date: new Date('2024-12-09'),
      content: 'CITAÇÃO - Processo nº 2002345-67.2024.8.05.0002 - Fica citado o réu João da Silva para responder aos termos da ação no prazo de 15 (quinze) dias, contados da juntada do mandado aos autos.',
      source: 'dje-ba',
      processNumber: '2002345-67.2024.8.05.0002',
      processId: '2',
      oabNumbers: ['BA 12345'],
      type: 'citacao',
      priority: 'media',
      deadline: addDays(new Date('2024-12-09'), 15),
      acknowledged: true,
      read: true,
      responsibleId: '1',
      responsibleName: 'Dr. João Silva',
      tags: ['citação', 'contestação'],
      clientName: 'Empresa ABC Ltda',
      createdAt: new Date('2024-12-09T09:15:00'),
    },
    {
      id: '3',
      date: new Date('2024-12-08'),
      content: 'DESPACHO - Processo nº 3003456-78.2024.8.05.0003 - Defiro o pedido de tutela antecipada. Cite-se o réu. Intime-se a parte autora para recolhimento das custas processuais no prazo de 10 dias.',
      source: 'dje-ba',
      processNumber: '3003456-78.2024.8.05.0003',
      oabNumbers: ['BA 12345'],
      type: 'despacho',
      priority: 'urgente',
      deadline: addDays(new Date('2024-12-08'), 10),
      acknowledged: true,
      read: true,
      responsibleId: '1',
      responsibleName: 'Dr. João Silva',
      tags: ['tutela', 'custas', 'citação'],
      createdAt: new Date('2024-12-08T10:45:00'),
    },
    {
      id: '4',
      date: new Date('2024-12-07'),
      content: 'PUBLICAÇÃO - Processo nº 4004567-89.2024.4.01.3400 - Audiência de conciliação designada para o dia 20/12/2024, às 14h00min, na sala de audiências da 1ª Vara do Trabalho.',
      source: 'dje-trt',
      processNumber: '4004567-89.2024.4.01.3400',
      oabNumbers: ['BA 12345'],
      type: 'publicacao',
      priority: 'alta',
      deadline: new Date('2024-12-20T14:00:00'),
      acknowledged: false,
      read: true,
      responsibleId: '2',
      responsibleName: 'Maria Santos',
      tags: ['audiência', 'conciliação', 'trabalhista'],
      createdAt: new Date('2024-12-07T11:20:00'),
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<'all' | 'dje-ba' | 'dou' | 'dje-trt' | 'dje-trf'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'intimacao' | 'citacao' | 'publicacao' | 'edital' | 'despacho'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'nao_lida' | 'lida' | 'nao_ciente' | 'ciente'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'baixa' | 'media' | 'alta' | 'urgente'>('all');

  const filteredPublications = publications.filter(pub => {
    const matchesSearch = pub.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pub.processNumber && pub.processNumber.includes(searchTerm)) ||
                         (pub.clientName && pub.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSource = selectedSource === 'all' || pub.source === selectedSource;
    const matchesType = selectedType === 'all' || pub.type === selectedType;
    const matchesPriority = selectedPriority === 'all' || pub.priority === selectedPriority;
    
    let matchesStatus = true;
    if (selectedStatus === 'nao_lida') matchesStatus = !pub.read;
    else if (selectedStatus === 'lida') matchesStatus = pub.read;
    else if (selectedStatus === 'nao_ciente') matchesStatus = !pub.acknowledged;
    else if (selectedStatus === 'ciente') matchesStatus = pub.acknowledged;
    
    return matchesSearch && matchesSource && matchesType && matchesStatus && matchesPriority;
  });

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
    const deadline = publication.deadline;
    
    if (isBefore(deadline, now)) {
      return { type: 'overdue', label: 'Prazo vencido', color: 'text-red-600' };
    } else if (isBefore(deadline, addDays(now, 3))) {
      return { type: 'urgent', label: 'Vence em breve', color: 'text-orange-600' };
    } else {
      return { type: 'normal', label: 'No prazo', color: 'text-green-600' };
    }
  };

  const unreadCount = publications.filter(p => !p.read).length;
  const unacknowledgedCount = publications.filter(p => !p.acknowledged).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publicações</h1>
          <p className="text-gray-600">Monitoramento de diários oficiais e intimações</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
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
              <p className="text-2xl font-bold text-blue-600">
                {publications.filter(p => 
                  format(p.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                ).length}
              </p>
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
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredPublications.length} publicação{filteredPublications.length !== 1 ? 'ões' : ''} encontrada{filteredPublications.length !== 1 ? 's' : ''}
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPublications.map((publication) => {
            const urgency = getUrgencyStatus(publication);
            return (
              <div key={publication.id} className={`p-6 hover:bg-gray-50 transition-colors ${
                !publication.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}>
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
                          <span>{format(publication.date, "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                        {publication.processNumber && (
                          <span className="font-mono">{publication.processNumber}</span>
                        )}
                        {publication.clientName && (
                          <span>{publication.clientName}</span>
                        )}
                        {publication.responsibleName && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{publication.responsibleName}</span>
                          </div>
                        )}
                      </div>
                      
                      {publication.deadline && urgency && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Prazo: {format(publication.deadline, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                          <span className={`text-sm font-medium ${urgency.color}`}>
                            ({urgency.label})
                          </span>
                        </div>
                      )}
                      
                      {publication.tags.length > 0 && (
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
                      <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors">
                        Dar Ciência
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
          
          {filteredPublications.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhuma publicação encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Publications;