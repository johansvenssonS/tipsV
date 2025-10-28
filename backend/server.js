import "dotenv/config";
import express from "express";
import cors from "cors";
import getKupong from "./puppeteer.js";
import { saveKupongToDb, loadKupongFromDb, getLastEntry } from "./kupong-db.js";
import { createUser, findUserByCode, generateUserCode } from "./auth-db.js";

const app = express();
const allowedOrigins = [
  "https://johansvenssons.github.io",
  "http://127.0.0.1:3000",
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json()); // Add JSON parsing middleware

// Helper function to get ISO week number
function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Auth endpoints
app.post("/backend/login", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const user = await findUserByCode(code);

    if (!user) {
      return res.status(401).json({ error: "Invalid code - team not found" });
    }

    res.json({
      name: user.name,
      code: user.code,
      kupong_data: user.kupong_data,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/backend/register", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Team name is required" });
    }

    const code = generateUserCode();
    const user = await createUser(name.trim(), code);

    res.json({
      name: user.name,
      code: user.code,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// /kupong endpoint
app.get("/kupong", async (req, res) => {
  const today = new Date();
  const week = getWeekNumber(today);
  const year = today.getFullYear();
  const day = today.getDay(); // 4 = Thursday
  const hours = today.getHours();

  try {
    // First, check if current week's kupong exists
    let kupong = await loadKupongFromDb(week, year);

    if (kupong) {
      // Current week found, return it
      res.json({ kupong });
      return;
    }

    // No current week - decide whether to scrape or show last entry
    if (day >= 4 && hours >= 12) {
      // After Thursday 12:00 - try scraping new kupong
      kupong = await getKupong();
      if (kupong && kupong.length > 0) {
        await saveKupongToDb(kupong, week, year);
        res.json({ kupong });
        return;
      }
    }

    // Before Thursday 12:00 OR scraping failed - get last entry
    const lastKupong = await getLastEntry(); // New function
    if (lastKupong) {
      res.json({
        kupong: lastKupong.data,
        info: `Showing kupong from week ${lastKupong.week}/${lastKupong.year}`,
      });
    } else {
      res.status(500).json({ error: "Ingen kupong tillgänglig" });
    }
  } catch (error) {
    console.error("kupong error:", error);
    res.status(500).json({
      error: "Något gick fel vid hämtning av kupong",
      details: error.message,
    });
  }
});
app.get("/", (req, res) => {
  res.send("StrykVänner backend server är igång!");
});

// Temporary migration endpoint - REMOVE after running once!
app.get("/create-users-table", async (req, res) => {
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        kupong_data JSONB DEFAULT NULL
      );
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_code ON users(code);
    `);
    
    res.json({ message: "Users table created successfully!" });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Use the Render-provided port or 3000 if running locally
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
