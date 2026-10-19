// src/components/Processes/ImportOabModal.tsx
import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface ImportOabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportOabModal({ isOpen, onClose, onSuccess }: ImportOabModalProps) {
  const [oabNumber, setOabNumber] = useState('');
  const [oabState, setOabState] = useState('BA');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [foundProcesses, setFoundProcesses] = useState<any[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/search-oab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oabNumber, oabState })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao consultar processos');
      }

      setFoundProcesses(data.processes || []);
      // Marca todos por padrão
      setSelectedNumbers((data.processes || []).map((p: any) => p.number));
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha na conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (number: string) => {
    setSelectedNumbers(prev =>
      prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
    );
  };

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    const processesToInsert = foundProcesses
      .filter(p => selectedNumbers.includes(p.number))
      .map(p => ({
        number: p.number,
        title: p.title,
        court: p.court,
        status: 'active',
        created_at: new Date().toISOString()
      }));

    const { error } = await supabase.from('processes').insert(processesToInsert);

    setIsSaving(false);

    if (error) {
      setErrorMessage(`Erro ao salvar no banco: ${error.message}`);
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Importar Processos por OAB</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Número OAB (Ex: 12345)"
              value={oabNumber}
              onChange={(e) => setOabNumber(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="UF"
              maxLength={2}
              value={oabState}
              onChange={(e) => setOabState(e.target.value.toUpperCase())}
              className="w-16 rounded-lg border border-gray-300 px-3 py-2 text-sm text-center uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Pesquisar
            </button>
          </form>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {foundProcesses.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                Processos Encontrados ({foundProcesses.length})
              </p>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {foundProcesses.map((proc) => (
                  <label
                    key={proc.number}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedNumbers.includes(proc.number)}
                      onChange={() => handleToggleSelect(proc.number)}
                      className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{proc.number}</div>
                      <div className="text-xs text-gray-500">{proc.court} • {proc.title}</div>
                      <div className="text-xs text-gray-400">Cliente: {proc.client_name}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={selectedNumbers.length === 0 || isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Anexar Selecionados ({selectedNumbers.length})
          </button>
        </div>
      </div>
    </div>
  );
}
