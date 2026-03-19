import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { isAuthenticated } from '../lib/auth';
import { listOpportunities, deleteOpportunity } from '../lib/api';
import type { Opportunity, PhaseKey } from '../types';
import { PHASE_LABELS } from '../types';
import LoginForm from '../components/LoginForm';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listOpportunities();
      setOpportunities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated, fetchData]);

  if (!authenticated) {
    return <LoginForm onSuccess={() => setAuthenticated(true)} />;
  }

  const handleDelete = async (id: number, conta: string) => {
    if (!window.confirm(`Tem certeza que deseja arquivar "${conta}"?`)) return;
    try {
      await deleteOpportunity(id);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciar Oportunidades
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Crie, edite e acompanhe as oportunidades de demo.
          </p>
        </div>
        <Link
          to="/admin/nova"
          className="flex items-center gap-2 px-4 py-2.5 bg-omilia-700 text-white rounded-xl text-sm font-semibold hover:bg-omilia-800 transition-colors no-underline"
        >
          <Plus size={16} />
          Nova Oportunidade
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Carregando...</div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">
            Nenhuma oportunidade cadastrada ainda.
          </p>
          <Link
            to="/admin/nova"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-omilia-700 text-white rounded-xl text-sm font-semibold hover:bg-omilia-800 transition-colors no-underline"
          >
            <Plus size={16} />
            Criar Primeira Oportunidade
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                  Conta
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                  AE
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                  Fase Atual
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                  Rodada
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp) => (
                <tr
                  key={opp.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {opp.conta}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {opp.account_executive}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {PHASE_LABELS[opp.current_phase as PhaseKey]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {opp.round_number}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/oportunidade/${opp.id}`}
                        className="p-2 text-gray-400 hover:text-omilia-700 hover:bg-omilia-50 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/admin/editar/${opp.id}`}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(opp.id, opp.conta)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Arquivar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
