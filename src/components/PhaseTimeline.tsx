import { Check, Clock, Circle } from 'lucide-react';
import type { Phase, PhaseKey } from '../types';
import { PHASE_LABELS, PHASE_COLORS } from '../types';

interface Props {
  phases: Phase[];
  isAdmin?: boolean;
  onUpdatePhase?: (phaseId: number, data: Partial<Phase>) => void;
}

export default function PhaseTimeline({ phases, isAdmin, onUpdatePhase }: Props) {
  // Group by round
  const rounds = new Map<number, Phase[]>();
  phases.forEach((p) => {
    const arr = rounds.get(p.round_number) || [];
    arr.push(p);
    rounds.set(p.round_number, arr);
  });

  const sortedRounds = Array.from(rounds.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <div className="space-y-6">
      {sortedRounds.map(([roundNum, roundPhases]) => (
        <div key={roundNum}>
          {sortedRounds.length > 1 && (
            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Rodada {roundNum}
            </h3>
          )}
          <div className="relative">
            {roundPhases
              .sort((a, b) => a.phase_order - b.phase_order)
              .map((phase, idx) => {
                const isCompleted = !!phase.completed_at;
                const isActive = !!phase.entry_date && !phase.completed_at;
                const color = PHASE_COLORS[phase.phase_key as PhaseKey];

                return (
                  <div key={phase.id} className="flex gap-4 pb-6 last:pb-0">
                    {/* Timeline line + icon */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? 'text-white'
                            : isActive
                              ? 'text-white ring-4 ring-opacity-20'
                              : 'bg-gray-100 text-gray-400'
                        }`}
                        style={
                          isCompleted || isActive
                            ? {
                                backgroundColor: color,
                                ...(isActive
                                  ? { boxShadow: `0 0 0 4px ${color}33` }
                                  : {}),
                              }
                            : {}
                        }
                      >
                        {isCompleted ? (
                          <Check size={16} />
                        ) : isActive ? (
                          <Clock size={16} />
                        ) : (
                          <Circle size={16} />
                        )}
                      </div>
                      {idx < roundPhases.length - 1 && (
                        <div
                          className="w-0.5 flex-1 mt-1"
                          style={{
                            backgroundColor: isCompleted ? color : '#e5e7eb',
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            isActive
                              ? 'text-gray-900'
                              : isCompleted
                                ? 'text-gray-700'
                                : 'text-gray-400'
                          }`}
                        >
                          {PHASE_LABELS[phase.phase_key as PhaseKey]}
                        </span>
                      </div>

                      {/* Read-only dates (non-admin) */}
                      {!isAdmin && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          {phase.entry_date && (
                            <span className="text-xs text-gray-500">
                              Início:{' '}
                              {new Date(
                                phase.entry_date + 'T00:00:00'
                              ).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {phase.estimated_delivery_date && (
                            <span className="text-xs text-gray-500">
                              Estimativa:{' '}
                              {new Date(
                                phase.estimated_delivery_date + 'T00:00:00'
                              ).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {phase.completed_at && (
                            <span className="text-xs text-green-600 font-medium">
                              Concluído:{' '}
                              {new Date(
                                phase.completed_at + 'T00:00:00'
                              ).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Admin editable dates — all phases */}
                      {isAdmin && onUpdatePhase && (
                        <div className="flex flex-wrap gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 whitespace-nowrap">
                              Início:
                            </label>
                            <input
                              type="date"
                              key={`entry-${phase.id}-${phase.entry_date}`}
                              defaultValue={phase.entry_date || ''}
                              onChange={(e) =>
                                onUpdatePhase(phase.id, {
                                  entry_date: e.target.value || null,
                                })
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 whitespace-nowrap">
                              Estimativa:
                            </label>
                            <input
                              type="date"
                              key={`est-${phase.id}-${phase.estimated_delivery_date}`}
                              defaultValue={phase.estimated_delivery_date || ''}
                              onChange={(e) =>
                                onUpdatePhase(phase.id, {
                                  estimated_delivery_date: e.target.value || null,
                                })
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 whitespace-nowrap">
                              Concluído:
                            </label>
                            <input
                              type="date"
                              key={`done-${phase.id}-${phase.completed_at}`}
                              defaultValue={phase.completed_at || ''}
                              onChange={(e) =>
                                onUpdatePhase(phase.id, {
                                  completed_at: e.target.value || null,
                                })
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            />
                          </div>
                          {isActive && (
                            <button
                              onClick={() =>
                                onUpdatePhase(phase.id, {
                                  completed_at: new Date()
                                    .toISOString()
                                    .slice(0, 10),
                                })
                              }
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Concluir Hoje
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
