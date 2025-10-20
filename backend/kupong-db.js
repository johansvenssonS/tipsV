import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function saveKupongToDb(kupong, week, year) {
  await pool.query(
    `INSERT INTO weekly_kupong (week, year, data)
         VALUES ($1, $2, $3)
         ON CONFLICT (week, year) DO UPDATE SET data = $3, created_at = NOW()`,
    [week, year, JSON.stringify(kupong)]
  );
}

export async function loadKupongFromDb(week, year) {
  const res = await pool.query(
    `SELECT data FROM weekly_kupong WHERE week = $1 AND year = $2`,
    [week, year]
  );
  return res.rows[0]?.data || null;
}

export async function getLastEntry() {
  const query = `
  SELECT data, week, year
  FROM weekly_kupong
  ORDER BY year DESC, week DESC
  LIMIT 1
  `;

  try {
    const res = await pool.query(query);
    if (res.rows.length > 0) {
      return {
        data: res.rows[0].data,
        week: res.rows[0].week,
        year: res.rows[0].year,
      };
    }
    return null;
  } catch (error) {
    console.error("Error med att ladda senaste entry:", error);
    return null;
  }
}
