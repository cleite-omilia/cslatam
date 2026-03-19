interface Env {
  DB: D1Database;
}

const PHASE_KEYS = [
  'discovery',
  'journey_creation',
  'sent_to_dev',
  'internal_tests',
  'partner_tests',
  'demo',
];

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'active';

  const opportunities = await env.DB.prepare(`
    SELECT o.*,
      p.entry_date as current_phase_entry_date,
      p.estimated_delivery_date as current_phase_estimated_delivery
    FROM opportunities o
    LEFT JOIN phases p ON p.opportunity_id = o.id
      AND p.round_number = o.round_number
      AND p.phase_key = o.current_phase
    WHERE o.status = ?
    ORDER BY o.updated_at DESC
  `).bind(status).all();

  return Response.json(opportunities.results);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json()) as {
    conta: string;
    account_executive: string;
    solution_consultant: string;
    sales_engineer: string;
    use_cases?: string;
  };

  if (!body.conta || !body.account_executive || !body.solution_consultant || !body.sales_engineer) {
    return new Response(JSON.stringify({ error: 'Campos obrigatórios faltando' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await env.DB.prepare(`
    INSERT INTO opportunities (conta, account_executive, solution_consultant, sales_engineer, use_cases)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    body.conta,
    body.account_executive,
    body.solution_consultant,
    body.sales_engineer,
    body.use_cases || ''
  ).run();

  const oppId = result.meta.last_row_id;
  const now = new Date().toISOString().slice(0, 10);

  // Insert all 6 phases for round 1
  const stmts = PHASE_KEYS.map((key, i) =>
    env.DB.prepare(`
      INSERT INTO phases (opportunity_id, round_number, phase_key, phase_order, entry_date)
      VALUES (?, 1, ?, ?, ?)
    `).bind(oppId, key, i + 1, i === 0 ? now : null)
  );

  await env.DB.batch(stmts);

  // Fetch the created opportunity
  const opp = await env.DB.prepare('SELECT * FROM opportunities WHERE id = ?')
    .bind(oppId)
    .first();

  return Response.json(opp, { status: 201 });
};
