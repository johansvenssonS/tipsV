import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS team_entries (
      id SERIAL PRIMARY KEY,
      code VARCHAR(20) NOT NULL,
      team VARCHAR(100) NOT NULL,
      week INTEGER NOT NULL,
      year INTEGER NOT NULL,
      data JSONB NOT NULL,
      locked BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (code, week, year)
    );
  `);
}

export async function upsertEntry({ code, team, week, year, data }) {
  await ensureTable();
  const existing = await pool.query(
    `SELECT id, locked FROM team_entries WHERE code=$1 AND week=$2 AND year=$3`,
    [code, week, year]
  );
  if (existing.rows[0]?.locked) {
    const err = new Error("Entry is locked and cannot be modified");
    err.code = "ENTRY_LOCKED";
    throw err;
  }
  await pool.query(
    `INSERT INTO team_entries (code, team, week, year, data)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (code, week, year)
     DO UPDATE SET data = EXCLUDED.data, team = EXCLUDED.team, updated_at = NOW()`,
    [code, team, week, year, JSON.stringify(data)]
  );
  return true;
}

export async function lockEntry({ code, week, year }) {
  await ensureTable();
  await pool.query(
    `UPDATE team_entries SET locked = TRUE, updated_at = NOW() WHERE code=$1 AND week=$2 AND year=$3`,
    [code, week, year]
  );
  return true;
}

export async function getLatestEntry(code) {
  await ensureTable();
  const res = await pool.query(
    `SELECT code, team, week, year, data, locked, created_at, updated_at
     FROM team_entries WHERE code=$1
     ORDER BY year DESC, week DESC, updated_at DESC
     LIMIT 1`,
    [code]
  );
  return res.rows[0] || null;
}

export async function getEntry(code, week, year) {
  await ensureTable();
  const res = await pool.query(
    `SELECT code, team, week, year, data, locked, created_at, updated_at
     FROM team_entries WHERE code=$1 AND week=$2 AND year=$3`,
    [code, week, year]
  );
  return res.rows[0] || null;
}

export async function listEntries(code) {
  await ensureTable();
  const res = await pool.query(
    `SELECT week, year, locked, updated_at FROM team_entries WHERE code=$1 ORDER BY year DESC, week DESC`,
    [code]
  );
  return res.rows;
}
