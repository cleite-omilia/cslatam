import { Link } from 'react-router-dom';
import { User, Calendar, AlertCircle } from 'lucide-react';
import type { Opportunity, PhaseKey } from '../types';
import { PHASE_COLORS } from '../types';

interface Props {
  opportunity: Opportunity;
}

function getDateStatus(estimated: string | null | undefined): 'on-track' | 'warning' | 'overdue' | 'none' {
  if (!estimated) return 'none';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const est = new Date(estimated + 'T00:00:00');
  const diff = (est.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'overdue';
  if (diff <= 3) return 'warning';
  return 'on-track';
}

const statusStyles = {
  'on-track': 'text-green-600 bg-green-50',
  warning: 'text-amber-600 bg-amber-50',
  overdue: 'text-red-600 bg-red-50',
  none: 'text-gray-400 bg-gray-50',
};

export default function OpportunityCard({ opportunity }: Props) {
  const color = PHASE_COLORS[opportunity.current_phase as PhaseKey];
  const dateStatus = getDateStatus(opportunity.current_phase_estimated_delivery);

  return (
    <Link
      to={`/oportunidade/${opportunity.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all no-underline group"
    >
      <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: color }} />
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-omilia-700 transition-colors mb-2">
          {opportunity.conta}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
          <User size={12} />
          <span>{opportunity.account_executive}</span>
        </div>

        {opportunity.round_number > 1 && (
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 mb-2">
            Rodada {opportunity.round_number}
          </span>
        )}

        {opportunity.current_phase_estimated_delivery && (
          <div
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg mt-2 ${statusStyles[dateStatus]}`}
          >
            {dateStatus === 'overdue' ? <AlertCircle size={12} /> : <Calendar size={12} />}
            <span>
              {dateStatus === 'overdue' ? 'Atrasado' : 'Estimativa'}:{' '}
              {new Date(opportunity.current_phase_estimated_delivery + 'T00:00:00').toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
