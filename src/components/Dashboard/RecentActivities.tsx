import React from 'react';
import { Clock, FileText, Users, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'process' | 'client' | 'task' | 'publication';
  title: string;
  description: string;
  time: Date;
  user: string;
}

const RecentActivities: React.FC = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'process',
      title: 'Novo andamento processual',
      description: 'Processo 1001234-56.2024.8.05.0001 - Juntada de petição',
      time: new Date('2024-12-10T14:30:00'),
      user: 'Dr. João Silva',
    },
    {
      id: '2',
      type: 'client',
      title: 'Cliente cadastrado',
      description: 'João da Silva Santos foi adicionado ao sistema',
      time: new Date('2024-12-10T13:15:00'),
      user: 'Maria Santos',
    },
    {
      id: '3',
      type: 'task',
      title: 'Tarefa vencida',
      description: 'Apresentar contestação - Prazo vencido',
      time: new Date('2024-12-10T12:00:00'),
      user: 'Sistema',
    },
    {
      id: '4',
      type: 'publication',
      title: 'Nova publicação',
      description: 'Intimação para apresentação de documentos',
      time: new Date('2024-12-10T10:45:00'),
      user: 'Sistema',
    },
  ];

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'process':
        return FileText;
      case 'client':
        return Users;
      case 'task':
        return AlertTriangle;
      case 'publication':
        return FileText;
      default:
        return Clock;
    }
  };

  const getIconColor = (type: Activity['type']) => {
    switch (type) {
      case 'process':
        return 'text-blue-600 bg-blue-50';
      case 'client':
        return 'text-green-600 bg-green-50';
      case 'task':
        return 'text-red-600 bg-red-50';
      case 'publication':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {activities.map((activity) => {
            const Icon = getIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${getIconColor(activity.type)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                  <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                    <span>{format(activity.time, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                    <span>•</span>
                    <span>{activity.user}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;