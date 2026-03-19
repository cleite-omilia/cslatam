CREATE TABLE IF NOT EXISTS opportunities (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  conta         TEXT NOT NULL,
  account_executive   TEXT NOT NULL,
  solution_consultant TEXT NOT NULL,
  sales_engineer      TEXT NOT NULL,
  use_cases     TEXT DEFAULT '',
  current_phase TEXT NOT NULL DEFAULT 'discovery',
  round_number  INTEGER NOT NULL DEFAULT 1,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS phases (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  opportunity_id          INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  round_number            INTEGER NOT NULL DEFAULT 1,
  phase_key               TEXT NOT NULL,
  phase_order             INTEGER NOT NULL,
  entry_date              TEXT,
  estimated_delivery_date TEXT,
  completed_at            TEXT,
  created_at              TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(opportunity_id, round_number, phase_key)
);

CREATE INDEX IF NOT EXISTS idx_phases_opp ON phases(opportunity_id, round_number);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
