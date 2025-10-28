import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function createUser(name, code) {
  try {
    await pool.query(
      `INSERT INTO users (name, code, kupong_data, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [name, code, null]
    );
    return { name, code };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function findUserByCode(code) {
  try {
    const res = await pool.query(
      `SELECT name, code, kupong_data FROM users WHERE code = $1`,
      [code]
    );
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
}

export async function updateUserKupong(code, kupongData) {
  try {
    await pool.query(`UPDATE users SET kupong_data = $1 WHERE code = $2`, [
      JSON.stringify(kupongData),
      code,
    ]);
  } catch (error) {
    console.error("Error updating user kupong:", error);
    throw error;
  }
}

// Generate unique user code
export function generateUserCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}
