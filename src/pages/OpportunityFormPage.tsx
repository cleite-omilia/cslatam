import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { isAuthenticated } from '../lib/auth';
import { getOpportunity, createOpportunity, updateOpportunity } from '../lib/api';
import LoginForm from '../components/LoginForm';

export default function OpportunityFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    conta: '',
    account_executive: '',
    solution_consultant: '',
    sales_engineer: '',
    use_cases: '',
  });

  useEffect(() => {
    if (isEdit && authenticated) {
      setLoading(true);
      getOpportunity(Number(id))
        .then((opp) => {
          setForm({
            conta: opp.conta,
            account_executive: opp.account_executive,
            solution_consultant: opp.solution_consultant,
            sales_engineer: opp.sales_engineer,
            use_cases: opp.use_cases || '',
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, authenticated]);

  if (!authenticated) {
    return <LoginForm onSuccess={() => setAuthenticated(true)} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateOpportunity(Number(id), form);
        navigate(`/oportunidade/${id}`);
      } else {
        const opp = await createOpportunity(form);
        navigate(`/oportunidade/${opp.id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar. Verifique os campos e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">Carregando...</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 no-underline"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Editar Oportunidade' : 'Nova Oportunidade'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conta *
            </label>
            <input
              type="text"
              name="conta"
              value={form.conta}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-omilia-500 focus:border-transparent"
              placeholder="Nome da conta/empresa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Executive *
            </label>
            <input
              type="text"
              name="account_executive"
              value={form.account_executive}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-omilia-500 focus:border-transparent"
              placeholder="Nome do AE"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solution Consultant *
            </label>
            <input
              type="text"
              name="solution_consultant"
              value={form.solution_consultant}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-omilia-500 focus:border-transparent"
              placeholder="Nome do SC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sales Engineer *
            </label>
            <input
              type="text"
              name="sales_engineer"
              value={form.sales_engineer}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-omilia-500 focus:border-transparent"
              placeholder="Nome do SE"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Use Cases
            </label>
            <textarea
              name="use_cases"
              value={form.use_cases}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-omilia-500 focus:border-transparent resize-y"
              placeholder="Descreva os casos de uso da demo..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-omilia-700 text-white rounded-xl text-sm font-semibold hover:bg-omilia-800 disabled:opacity-50 transition-colors"
            >
              <Save size={16} />
              {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Oportunidade'}
            </button>
            <Link
              to="/admin"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors no-underline"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
