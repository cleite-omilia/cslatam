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

  // Recalculate current_phase based on all phases in the current round
  if (body.completed_at !== undefined) {
    const phase = await env.DB.prepare('SELECT * FROM phases WHERE id = ?')
      .bind(id)
      .first<{ opportunity_id: number; phase_key: string; round_number: number }>();

    if (phase) {
      // Get the opportunity's current round
      const opp = await env.DB.prepare('SELECT round_number FROM opportunities WHERE id = ?')
        .bind(phase.opportunity_id)
        .first<{ round_number: number }>();

      if (opp) {
        // Get all phases for the current round, ordered
        const allPhases = await env.DB.prepare(`
          SELECT phase_key, completed_at, entry_date FROM phases
          WHERE opportunity_id = ? AND round_number = ?
          ORDER BY phase_order ASC
        `).bind(phase.opportunity_id, opp.round_number).all<{ phase_key: string; completed_at: string | null; entry_date: string | null }>();

        // Find the first non-completed phase with an entry_date, or the first non-completed phase
        let newCurrentPhase = allPhases.results[allPhases.results.length - 1]?.phase_key;
        for (const p of allPhases.results) {
          if (!p.completed_at) {
            newCurrentPhase = p.phase_key;
            break;
          }
        }

        await env.DB.prepare(`
          UPDATE opportunities SET current_phase = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(newCurrentPhase, phase.opportunity_id).run();

        // If a phase was just completed, set entry_date on the next phase if not already set
        if (body.completed_at) {
          const nextPhase = PHASE_ORDER[phase.phase_key];
          if (nextPhase) {
            await env.DB.prepare(`
              UPDATE phases SET entry_date = COALESCE(entry_date, ?)
              WHERE opportunity_id = ? AND round_number = ? AND phase_key = ?
            `).bind(
              new Date().toISOString().slice(0, 10),
              phase.opportunity_id, opp.round_number, nextPhase
            ).run();
          }
        }
      }
    }
  }

  const updated = await env.DB.prepare('SELECT * FROM phases WHERE id = ?')
    .bind(id)
    .first();

  return Response.json(updated);
};
