interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = params.id;
  const phases = await env.DB.prepare(
    'SELECT * FROM phases WHERE opportunity_id = ? ORDER BY round_number, phase_order'
  )
    .bind(id)
    .all();

  return Response.json(phases.results);
};
