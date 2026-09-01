import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS weekly_results (
      id SERIAL PRIMARY KEY,
      week INTEGER NOT NULL,
      year INTEGER NOT NULL,
      match_index INTEGER NOT NULL,
      match_label TEXT NOT NULL,
      outcome CHAR(1),
      home_score INTEGER,
      away_score INTEGER,
      matched BOOLEAN NOT NULL DEFAULT FALSE,
      resolved_at TIMESTAMP,
      UNIQUE (week, year, match_index)
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS results_fetch_log (
      week INTEGER NOT NULL,
      year INTEGER NOT NULL,
      last_attempted_at TIMESTAMP NOT NULL,
      PRIMARY KEY (week, year)
    );
  `);
}

// Throttles calls out to the football API — persisted in the DB (not
// in-memory) since Render's free tier can cold-start between requests,
// which would otherwise reset an in-process cooldown.
export async function shouldAttemptFetch(week, year, cooldownMinutes) {
  await ensureTable();
  const res = await pool.query(
    `SELECT last_attempted_at FROM results_fetch_log WHERE week=$1 AND year=$2`,
    [week, year]
  );
  const lastAttempt = res.rows[0]?.last_attempted_at;
  if (!lastAttempt) return true;
  const minutesSince = (Date.now() - new Date(lastAttempt).getTime()) / 60000;
  return minutesSince >= cooldownMinutes;
}

export async function recordFetchAttempt(week, year) {
  await ensureTable();
  await pool.query(
    `INSERT INTO results_fetch_log (week, year, last_attempted_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (week, year) DO UPDATE SET last_attempted_at = NOW()`,
    [week, year]
  );
}

export async function upsertResults({ week, year, results }) {
  await ensureTable();
  for (const r of results) {
    const outcome = r.outcome ?? null;
    const resolvedAt = outcome ? new Date() : null;
    await pool.query(
      `INSERT INTO weekly_results (week, year, match_index, match_label, outcome, home_score, away_score, matched, resolved_at)
       VALUES ($1, $2, $3, $4, $5::char(1), $6, $7, $8, $9::timestamp)
       ON CONFLICT (week, year, match_index)
       DO UPDATE SET
         match_label = EXCLUDED.match_label,
         outcome = COALESCE(weekly_results.outcome, EXCLUDED.outcome),
         home_score = COALESCE(weekly_results.home_score, EXCLUDED.home_score),
         away_score = COALESCE(weekly_results.away_score, EXCLUDED.away_score),
         matched = weekly_results.matched OR EXCLUDED.matched,
         resolved_at = CASE
           WHEN weekly_results.outcome IS NULL AND EXCLUDED.outcome IS NOT NULL THEN NOW()
           ELSE weekly_results.resolved_at
         END`,
      [
        week,
        year,
        r.index,
        r.label,
        outcome,
        r.homeScore ?? null,
        r.awayScore ?? null,
        !!r.matched,
        resolvedAt,
      ]
    );
  }
  return true;
}

export async function getResults(week, year) {
  await ensureTable();
  const res = await pool.query(
    `SELECT match_index AS index, match_label AS label, outcome, home_score AS "homeScore",
            away_score AS "awayScore", matched, resolved_at AS "resolvedAt"
     FROM weekly_results WHERE week=$1 AND year=$2 ORDER BY match_index`,
    [week, year]
  );
  return res.rows;
}

export async function setResultOverride({ week, year, matchIndex, outcome }) {
  await ensureTable();
  if (!["1", "X", "2"].includes(outcome)) {
    const err = new Error("outcome must be '1', 'X', or '2'");
    err.code = "INVALID_OUTCOME";
    throw err;
  }
  const res = await pool.query(
    `UPDATE weekly_results
     SET outcome = $4, matched = TRUE, resolved_at = NOW()
     WHERE week=$1 AND year=$2 AND match_index=$3
     RETURNING match_index`,
    [week, year, matchIndex, outcome]
  );
  if (res.rows.length === 0) {
    await pool.query(
      `INSERT INTO weekly_results (week, year, match_index, match_label, outcome, matched, resolved_at)
       VALUES ($1, $2, $3, $4, $5, TRUE, NOW())`,
      [week, year, matchIndex, `Match ${matchIndex}`, outcome]
    );
  }
  return true;
}
