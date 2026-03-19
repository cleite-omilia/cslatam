interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = params.id;
  const opp = await env.DB.prepare('SELECT * FROM opportunities WHERE id = ?')
    .bind(id)
    .first();

  if (!opp) {
    return new Response(JSON.stringify({ error: 'Oportunidade não encontrada' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const phases = await env.DB.prepare(
    'SELECT * FROM phases WHERE opportunity_id = ? ORDER BY round_number, phase_order'
  )
    .bind(id)
    .all();

  return Response.json({ ...opp, phases: phases.results });
};

export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const id = params.id;
  const body = (await request.json()) as Record<string, unknown>;

  const allowedFields = ['conta', 'account_executive', 'solution_consultant', 'sales_engineer', 'use_cases', 'status'];
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(body[field]);
    }
  }

  if (updates.length === 0) {
    return new Response(JSON.stringify({ error: 'Nenhum campo para atualizar' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  await env.DB.prepare(
    `UPDATE opportunities SET ${updates.join(', ')} WHERE id = ?`
  )
    .bind(...values)
    .run();

  const opp = await env.DB.prepare('SELECT * FROM opportunities WHERE id = ?')
    .bind(id)
    .first();

  return Response.json(opp);
};

export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
  const id = params.id;
  await env.DB.prepare(
    "UPDATE opportunities SET status = 'archived', updated_at = datetime('now') WHERE id = ?"
  )
    .bind(id)
    .run();

  return Response.json({ success: true });
};
