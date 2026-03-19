import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';
import { isAuthenticated, clearToken } from '../lib/auth';

export default function Layout() {
  const location = useLocation();
  const isAdmin = isAuthenticated();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 no-underline">
              <div className="w-9 h-9 bg-omilia-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  Demo Tracker
                </h1>
                <p className="text-xs text-gray-500 leading-tight">
                  SC LATAM
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                  location.pathname === '/'
                    ? 'bg-omilia-50 text-omilia-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard size={18} />
                Pipeline
              </Link>
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                  isAdminRoute
                    ? 'bg-omilia-50 text-omilia-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck size={18} />
                Admin
              </Link>
              {isAdmin && (
                <button
                  onClick={() => {
                    clearToken();
                    window.location.href = '/';
                  }}
                  className="ml-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sair
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
