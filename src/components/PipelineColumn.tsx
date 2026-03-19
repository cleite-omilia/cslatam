import type { Opportunity, PhaseKey } from '../types';
import { PHASE_LABELS, PHASE_COLORS } from '../types';
import OpportunityCard from './OpportunityCard';

interface Props {
  phaseKey: PhaseKey;
  opportunities: Opportunity[];
}

export default function PipelineColumn({ phaseKey, opportunities }: Props) {
  const color = PHASE_COLORS[phaseKey];
  const label = PHASE_LABELS[phaseKey];

  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <h2 className="text-sm font-semibold text-gray-700">{label}</h2>
        <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {opportunities.length}
        </span>
      </div>
      <div className="space-y-3 min-h-[200px]">
        {opportunities.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} />
        ))}
        {opportunities.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-xl">
            Nenhuma oportunidade
          </div>
        )}
      </div>
    </div>
  );
}
