import { getToken } from './auth';
import type { Opportunity, Phase } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function login(password: string): Promise<{ token: string }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export async function listOpportunities(): Promise<Opportunity[]> {
  return request('/opportunities');
}

export async function getOpportunity(id: number): Promise<Opportunity> {
  return request(`/opportunities/${id}`);
}

export async function createOpportunity(
  data: Omit<Opportunity, 'id' | 'current_phase' | 'round_number' | 'status' | 'created_at' | 'updated_at' | 'phases' | 'current_phase_entry_date' | 'current_phase_estimated_delivery'>
): Promise<Opportunity> {
  return request('/opportunities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOpportunity(
  id: number,
  data: Partial<Opportunity>
): Promise<Opportunity> {
  return request(`/opportunities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOpportunity(id: number): Promise<void> {
  await request(`/opportunities/${id}`, { method: 'DELETE' });
}

export async function getPhases(opportunityId: number): Promise<Phase[]> {
  return request(`/opportunities/${opportunityId}/phases`);
}

export async function updatePhase(
  phaseId: number,
  data: Partial<Phase>
): Promise<Phase> {
  return request(`/phases/${phaseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function createNewRound(opportunityId: number): Promise<void> {
  await request(`/opportunities/${opportunityId}/rounds`, { method: 'POST' });
}
