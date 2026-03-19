interface Env {
  DB: D1Database;
  ADMIN_PASSWORD: string;
}

function verifyToken(token: string, password: string): boolean {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.role !== 'admin') return false;
    if (decoded.exp < Date.now()) return false;
    if (decoded.key !== password) return false;
    return true;
  } catch {
    return false;
  }
}

async function ensureTables(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conta TEXT NOT NULL,
      account_executive TEXT NOT NULL,
      solution_consultant TEXT NOT NULL,
      sales_engineer TEXT NOT NULL,
      use_cases TEXT DEFAULT '',
      current_phase TEXT NOT NULL DEFAULT 'discovery',
      round_number INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS phases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      round_number INTEGER NOT NULL DEFAULT 1,
      phase_key TEXT NOT NULL,
      phase_order INTEGER NOT NULL,
      entry_date TEXT,
      estimated_delivery_date TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(opportunity_id, round_number, phase_key)
    )`),
  ]);
}

let tablesEnsured = false;

export const onRequest: PagesFunction<Env>[] = [
  async (context) => {
    // Auto-migrate tables
    if (!tablesEnsured) {
      await ensureTables(context.env.DB);
      tablesEnsured = true;
    }

    // CORS
    if (context.request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Auth check for mutating requests
    const method = context.request.method;
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      const path = new URL(context.request.url).pathname;
      // Allow login without token
      if (!path.endsWith('/auth/login')) {
        const authHeader = context.request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Não autorizado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const token = authHeader.slice(7);
        if (!verifyToken(token, context.env.ADMIN_PASSWORD)) {
          return new Response(JSON.stringify({ error: 'Token inválido' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    const response = await context.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  },
];
