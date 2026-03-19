export const PHASE_KEYS = [
  'discovery',
  'journey_creation',
  'sent_to_dev',
  'internal_tests',
  'partner_tests',
  'demo',
] as const;

export type PhaseKey = (typeof PHASE_KEYS)[number];

export const PHASE_LABELS: Record<PhaseKey, string> = {
  discovery: 'Discovery',
  journey_creation: 'Criação das Jornadas',
  sent_to_dev: 'Envio para Desenvolvimento',
  internal_tests: 'Testes Internos',
  partner_tests: 'Testes com Parceiro',
  demo: 'Demonstração',
};

export const PHASE_COLORS: Record<PhaseKey, string> = {
  discovery: '#3b82f6',
  journey_creation: '#6366f1',
  sent_to_dev: '#8b5cf6',
  internal_tests: '#f59e0b',
  partner_tests: '#f97316',
  demo: '#22c55e',
};

export interface Phase {
  id: number;
  opportunity_id: number;
  round_number: number;
  phase_key: PhaseKey;
  phase_order: number;
  entry_date: string | null;
  estimated_delivery_date: string | null;
  completed_at: string | null;
}

export interface Opportunity {
  id: number;
  conta: string;
  account_executive: string;
  solution_consultant: string;
  sales_engineer: string;
  use_cases: string;
  current_phase: PhaseKey;
  round_number: number;
  status: 'active' | 'won' | 'lost' | 'archived';
  created_at: string;
  updated_at: string;
  phases?: Phase[];
  current_phase_entry_date?: string | null;
  current_phase_estimated_delivery?: string | null;
}
