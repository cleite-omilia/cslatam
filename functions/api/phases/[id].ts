interface Env {
  DB: D1Database;
}

const PHASE_ORDER: Record<string, string | null> = {
  discovery: 'journey_creation',
  journey_creation: 'sent_to_dev',
  sent_to_dev: 'internal_tests',
  internal_tests: 'partner_tests',
  partner_tests: 'demo',
  demo: null,
};

export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const id = params.id;
  const body = (await request.json()) as {
    entry_date?: string;
    estimated_delivery_date?: string;
    completed_at?: string;
  };

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.entry_date !== undefined) {
    updates.push('entry_date = ?');
    values.push(body.entry_date);
  }
  if (body.estimated_delivery_date !== undefined) {
    updates.push('estimated_delivery_date = ?');
    values.push(body.estimated_delivery_date);
  }
  if (body.completed_at !== undefined) {
    updates.push('completed_at = ?');
    values.push(body.completed_at);
  }

  if (updates.length === 0) {
    return new Response(JSON.stringify({ error: 'Nenhum campo para atualizar' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  values.push(id);
  await env.DB.prepare(`UPDATE phases SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  // If phase was completed, advance the opportunity to next phase
  if (body.completed_at) {
    const phase = await env.DB.prepare('SELECT * FROM phases WHERE id = ?')
      .bind(id)
      .first<{ opportunity_id: number; phase_key: string; round_number: number }>();

    if (phase) {
      const nextPhase = PHASE_ORDER[phase.phase_key];
      if (nextPhase) {
        const now = new Date().toISOString().slice(0, 10);
        // Update opportunity current_phase
        await env.DB.prepare(`
          UPDATE opportunities SET current_phase = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(nextPhase, phase.opportunity_id).run();

        // Set entry_date on next phase
        await env.DB.prepare(`
          UPDATE phases SET entry_date = ?
          WHERE opportunity_id = ? AND round_number = ? AND phase_key = ? AND entry_date IS NULL
        `).bind(now, phase.opportunity_id, phase.round_number, nextPhase).run();
      }
    }
  }

  const updated = await env.DB.prepare('SELECT * FROM phases WHERE id = ?')
    .bind(id)
    .first();

  return Response.json(updated);
};
