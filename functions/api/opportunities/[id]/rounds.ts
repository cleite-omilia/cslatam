interface Env {
  DB: D1Database;
}

const ROUND_PHASE_KEYS = [
  'journey_creation',
  'sent_to_dev',
  'internal_tests',
  'partner_tests',
  'demo',
];

export const onRequestPost: PagesFunction<Env> = async ({ params, env }) => {
  const id = params.id;

  const opp = await env.DB.prepare('SELECT * FROM opportunities WHERE id = ?')
    .bind(id)
    .first<{ round_number: number; current_phase: string }>();

  if (!opp) {
    return new Response(JSON.stringify({ error: 'Oportunidade não encontrada' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const newRound = opp.round_number + 1;
  const now = new Date().toISOString().slice(0, 10);

  // Update opportunity
  await env.DB.prepare(`
    UPDATE opportunities
    SET round_number = ?, current_phase = 'journey_creation', updated_at = datetime('now')
    WHERE id = ?
  `).bind(newRound, id).run();

  // Insert phases for new round (skip discovery)
  const stmts = ROUND_PHASE_KEYS.map((key, i) =>
    env.DB.prepare(`
      INSERT INTO phases (opportunity_id, round_number, phase_key, phase_order, entry_date)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, newRound, key, i + 2, i === 0 ? now : null)
  );

  await env.DB.batch(stmts);

  return Response.json({ success: true, round_number: newRound }, { status: 201 });
};
