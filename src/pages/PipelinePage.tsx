import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { listOpportunities } from '../lib/api';
import { PHASE_KEYS } from '../types';
import type { Opportunity, PhaseKey } from '../types';
import PipelineColumn from '../components/PipelineColumn';

export default function PipelinePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await listOpportunities();
      setOpportunities(data);
    } catch (e) {
      console.error('Erro ao carregar oportunidades:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedByPhase = PHASE_KEYS.reduce(
    (acc, key) => {
      acc[key] = opportunities.filter((o) => o.current_phase === key);
      return acc;
    },
    {} as Record<PhaseKey, Opportunity[]>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Demos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {opportunities.length} oportunidade{opportunities.length !== 1 ? 's' : ''} ativa{opportunities.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {loading && opportunities.length === 0 ? (
        <div className="flex justify-center py-20">
          <RefreshCw size={32} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PHASE_KEYS.map((key) => (
            <PipelineColumn
              key={key}
              phaseKey={key}
              opportunities={groupedByPhase[key]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
