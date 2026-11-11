// src/components/Processes/ProcessDetailsModal.tsx
import React, { useState } from 'react';
import { 
  X, Scale, User, Building2, Calendar, FileText, 
  CheckSquare, DollarSign, Bell, Clock, Upload, 
  Download, Eye, Plus, CheckCircle2, Copy, Check,
  AlertCircle, ChevronRight, Sparkles
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GenerateDocumentModal } from '../Documents/GenerateDocumentModal';

interface ProcessDetailsModalProps {
  process: any;
  onClose: () => void;
  onEdit: (process: any) => void;
}

export const ProcessDetailsModal: React.FC<ProcessDetailsModalProps> = ({ 
  process, 
  onClose, 
  onEdit 
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'publicacoes' | 'tarefas' | 'documentos' | 'financeiro'>('geral');
  const [cnjCopiado, setCnjCopiado] = useState(false);
  const [modalGerarDocAberto, setModalGerarDocAberto] = useState(false);
  const queryClient = useQueryClient();

  // 1. Busca Publicações/Intimações vinculadas a este processo
  const { data: publicacoes = [], isLoading: loadingPubs } = useQuery({
    queryKey: ['process-publications', process.id, process.number],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .or(`process_id.eq.${process.id},process_number.eq.${process.number}`)
        .order('publication_date', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // 2. Busca Tarefas/Prazos vinculados a este processo
  const { data: tarefas = [], isLoading: loadingTarefas } = useQuery({
    queryKey: ['process-tasks', process.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, assigned_user:users(id, name)')
        .eq('process_id', process.id)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // 3. Busca Documentos vinculados a este processo
  const { data: documentos = [], isLoading: loadingDocs } = useQuery({
    queryKey: ['process-documents', process.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('process_id', process.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // 4. Busca Lançamentos Financeiros deste processo
  const { data: lancamentos = [], isLoading: loadingFin } = useQuery({
    queryKey: ['process-financial', process.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_entries')
        .select('*')
        .eq('process_id', process.id)
        .order('due_date', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Concluir tarefa rapidamente
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'concluida', updated_at: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process-tasks', process.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const handleCopiarCnj = () => {
    navigator.clipboard.writeText(process.number);
    setCnjCopiado(true);
    setTimeout(() => setCnjCopiado(false), 2000);
  };

  const formatDate = (dateVal?: string | Date) => {
    if (!dateVal) return '-';
    try {
      const str = String(dateVal);
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        const [year, month, day] = str.slice(0, 10).split('-');
        return `${day}/${month}/${year}`;
      }
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '-';
      return format(d, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const tabs = [
    { id: 'geral', label: 'Dados dos Autos', icon: Scale, count: null },
    { id: 'publicacoes', label: 'Intimações & DJE', icon: Bell, count: publicacoes.length },
    { id: 'tarefas', label: 'Prazos & Audiências', icon: Clock, count: tarefas.filter((t: any) => t.status !== 'concluida').length },
    { id: 'documentos', label: 'Pasta Digital', icon: FileText, count: documentos.length },
    { id: 'financeiro', label: 'Honorários & Custas', icon: DollarSign, count: lancamentos.length },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-xl border border-slate-200 shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        
        {/* Topo Institucional da Ficha */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
              <Scale className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-slate-900 tracking-tight">
                  {process.number}
                </span>
                <button
                  type="button"
                  onClick={handleCopiarCnj}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                  title="Copiar número CNJ"
                >
                  {cnjCopiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <span className="px-2 py-0.5 text-[10px] font-semibold border rounded-sm uppercase bg-emerald-50 text-emerald-700 border-emerald-200">
                  {process.status || 'Ativo'}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium border rounded-sm capitalize bg-slate-100 text-slate-700 border-slate-200">
                  Fase: {process.phase || 'Conhecimento'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                {process.subject || process.title || 'Ação Judicial'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                onClose();
                onEdit(process);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md transition shadow-2xs"
            >
              Editar Autos
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Abas do Processo */}
        <div className="px-5 border-b border-slate-200 bg-white flex gap-1 overflow-x-auto shrink-0 select-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Conteúdo Dinâmico por Aba */}
        <div className="p-5 flex-1 overflow-y-auto bg-slate-50/40 text-xs">
          
          {/* ABA 1: DADOS GERAIS */}
          {activeTab === 'geral' && (
            <div className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-indigo-600" /> Autor / Promovente (Cliente)
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {process.client?.name || process.plaintiff || 'Não informado'}
                  </p>
                  {process.client?.document && (
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">CPF/CNPJ: {process.client.document}</p>
                  )}
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> Réu / Promovido (Parte Contrária)
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {process.defendant || 'Não informado'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Polo Passivo</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs divide-y divide-slate-100">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Classe Processual</span>
                  <span className="font-semibold text-slate-800">{process.class || 'Procedimento Comum Cível'}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Vara / Tribunal / Juízo</span>
                  <span className="font-medium text-slate-800">{process.court || 'Tribunal de Justiça da Bahia (TJ-BA)'}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Data de Distribuição</span>
                  <span className="font-mono font-medium text-slate-800">
                    {formatDate(process.distributionDate || process.distribution_date)}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Valor da Causa</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {process.value ? `R$ ${Number(process.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não atribuído'}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Data de Registro no Sistema</span>
                  <span className="font-mono text-slate-500">{formatDate(process.createdAt || process.created_at)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: INTIMAÇÕES E PUBLICAÇÕES DJE */}
          {activeTab === 'publicacoes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Diário de Justiça & Notificações</h4>
                  <p className="text-[11px] text-slate-500">Intimações recebidas via varredura do Gmail / DJE vinculadas a este processo</p>
                </div>
              </div>

              {loadingPubs ? (
                <div className="py-12 text-center text-slate-400">Carregando intimações do caso...</div>
              ) : publicacoes.length === 0 ? (
                <div className="py-12 text-center bg-white border border-slate-200 rounded-lg p-6">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Nenhuma intimação registrada para estes autos</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">As publicações importadas pelo script do Gmail aparecerão aqui automaticamente.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {publicacoes.map((pub: any) => (
                    <div key={pub.id} className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {pub.court || 'TJ-BA'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {formatDate(pub.publication_date || pub.date)}
                        </span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-mono text-[11px] whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-100">
                        {pub.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 3: PRAZOS E AUDIÊNCIAS */}
          {activeTab === 'tarefas' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Compromissos e Prazos Fatais</h4>
                  <p className="text-[11px] text-slate-500">Contestações, recursos e audiências agendadas</p>
                </div>
              </div>

              {loadingTarefas ? (
                <div className="py-12 text-center text-slate-400">Carregando prazos...</div>
              ) : tarefas.length === 0 ? (
                <div className="py-12 text-center bg-white border border-slate-200 rounded-lg p-6">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Nenhum prazo pendente para este processo</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Você pode criar tarefas vinculadas a este processo pelo módulo de Prazos.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg overflow-hidden">
                  {tarefas.map((tarefa: any) => {
                    const isDone = tarefa.status === 'concluida';
                    return (
                      <div key={tarefa.id} className="p-3.5 flex items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <p className={`font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {tarefa.title}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                            <span>Vencimento: {formatDate(tarefa.due_date)}</span>
                            {tarefa.assigned_user?.name && <span>Resp: {tarefa.assigned_user.name}</span>}
                          </div>
                        </div>

                        {!isDone && (
                          <button
                            onClick={() => completeTaskMutation.mutate(tarefa.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Cumprir
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ABA 4: PASTA DIGITAL (DOCUMENTOS) COM GERADOR INTELIGENTE */}
          {activeTab === 'documentos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Peças e Pasta Digital</h4>
                  <p className="text-[11px] text-slate-500">Petições, procurações, comprovantes e minutas do processo</p>
                </div>

                {/* Botão de Criação a partir de Modelo */}
                <button
                  type="button"
                  onClick={() => setModalGerarDocAberto(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gerar Peça por Modelo</span>
                </button>
              </div>

              {loadingDocs ? (
                <div className="py-12 text-center text-slate-400">Carregando documentos...</div>
              ) : documentos.length === 0 ? (
                <div className="py-12 text-center bg-white border border-slate-200 rounded-lg p-6">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Nenhum documento anexado aos autos</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Utilize o botão acima para gerar procurações e declarações preenchidas automaticamente.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg overflow-hidden">
                  {documentos.map((doc: any) => (
                    <div key={doc.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{doc.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{formatDate(doc.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-slate-400 hover:text-slate-800 rounded">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-slate-800 rounded">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 5: FINANCEIRO DO PROCESSO */}
          {activeTab === 'financeiro' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Honorários e Custas Processuais</h4>
                  <p className="text-[11px] text-slate-500">Valores faturados, recebidos e pendentes neste processo</p>
                </div>
              </div>

              {loadingFin ? (
                <div className="py-12 text-center text-slate-400">Carregando financeiro...</div>
              ) : lancamentos.length === 0 ? (
                <div className="py-12 text-center bg-white border border-slate-200 rounded-lg p-6">
                  <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Nenhum lançamento financeiro vinculado</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cadastre honorários vinculados ao número deste processo na aba Financeiro.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg overflow-hidden">
                  {lancamentos.map((l: any) => {
                    const isExpense = l.type === 'despesa';
                    return (
                      <div key={l.id} className="p-3.5 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{l.description}</p>
                          <span className="text-[10px] text-slate-400 font-mono">Venc: {formatDate(l.due_date)}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className={`font-bold ${isExpense ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {isExpense ? '-' : '+'}R$ {Number(l.value || l.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="block text-[10px] text-slate-400 capitalize">{l.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Rodapé da Ficha */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md transition shadow-2xs"
          >
            Fechar Ficha
          </button>
        </div>

      </div>

      {/* Modal Inteligente de Geração de Peças */}
      {modalGerarDocAberto && (
        <GenerateDocumentModal
          process={process}
          onClose={() => setModalGerarDocAberto(false)}
        />
      )}
    </div>
  );
};

export default ProcessDetailsModal;
