import { useState } from 'react';
import { Lock } from 'lucide-react';
import { login } from '../lib/api';
import { setToken } from '../lib/auth';

interface Props {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await login(password);
      setToken(token);
      onSuccess();
    } catch {
      setError('Senha incorreta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-omilia-100 rounded-full flex items-center justify-center">
            <Lock className="text-omilia-700" size={24} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Acesso Administrativo
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Digite a senha de administrador para gerenciar oportunidades.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-omilia-500 focus:border-transparent"
            autoFocus
          />
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full mt-4 bg-omilia-700 text-white py-3 rounded-xl text-sm font-semibold hover:bg-omilia-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
