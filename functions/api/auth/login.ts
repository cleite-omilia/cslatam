interface Env {
  ADMIN_PASSWORD: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { password } = (await request.json()) as { password: string };

  if (!password || password !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Senha incorreta' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = btoa(
    JSON.stringify({
      role: 'admin',
      exp: Date.now() + 24 * 60 * 60 * 1000,
      key: env.ADMIN_PASSWORD,
    })
  );

  return Response.json({ token });
};
