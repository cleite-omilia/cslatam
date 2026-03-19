import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, User, Wrench, Briefcase, FileText, Plus, Pencil } from 'lucide-react';
import { getOpportunity, updatePhase, createNewRound } from '../lib/api';
import { isAuthenticated } from '../lib/auth';
import type { Opportunity, Phase } from '../types';
import { PHASE_LABELS } from '../types';
import type { PhaseKey } from '../types';
import PhaseTimeline from '../components/PhaseTimeline';

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = isAuthenticated();

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getOpportunity(Number(id));
      setOpp(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdatePhase = async (phaseId: number, data: Partial<Phase>) => {
    try {
      await updatePhase(phaseId, data);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewRound = async () => {
    if (!opp) return;
    if (!window.confirm('Iniciar uma nova rodada de desenvolvimento?')) return;
    try {
      await createNewRound(opp.id);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-gray-400">
        Carregando...
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="text-center py-20 text-gray-500">
        Oportunidade não encontrada.
      </div>
    );
  }

  const isDemoCompleted =
    opp.phases?.some(
      (p) =>
        p.phase_key === 'demo' &&
        p.round_number === opp.round_number &&
        p.completed_at
    ) ?? false;

  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 no-underline"
      >
        <ArrowLeft size={16} />
        Voltar ao Pipeline
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{opp.conta}</h2>
              {isAdmin && (
                <Link
                  to={`/admin/editar/${opp.id}`}
                  className="p-2 text-gray-400 hover:text-omilia-700 hover:bg-omilia-50 rounded-lg transition-colors"
                >
                  <Pencil size={16} />
                </Link>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Fase Atual</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {PHASE_LABELS[opp.current_phase as PhaseKey]}
                  </p>
                  {opp.round_number > 1 && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 mt-1">
                      Rodada {opp.round_number}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Account Executive</p>
                  <p className="text-sm text-gray-900">{opp.account_executive}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Wrench size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Solution Consultant</p>
                  <p className="text-sm text-gray-900">{opp.solution_consultant}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Sales Engineer</p>
                  <p className="text-sm text-gray-900">{opp.sales_engineer}</p>
                </div>
              </div>

              {opp.use_cases && (
                <div className="flex items-start gap-3">
                  <FileText size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Use Cases</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {opp.use_cases}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Progresso das Fases
            </h3>
            <PhaseTimeline
              phases={opp.phases || []}
              isAdmin={isAdmin}
              onUpdatePhase={handleUpdatePhase}
            />

            {isAdmin && isDemoCompleted && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleNewRound}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors"
                >
                  <Plus size={16} />
                  Iniciar Nova Rodada
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Inicia uma nova rodada de desenvolvimento a partir de &quot;Criação das
                  Jornadas&quot;.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
