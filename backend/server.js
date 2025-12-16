import "dotenv/config";
import express from "express";
import cors from "cors";
import getKupong from "./puppeteer.js";
import { saveKupongToDb, loadKupongFromDb, getLastEntry } from "./kupong-db.js";
import {
  createUser,
  findUserByCode,
  generateUserCode,
  updateTeamPlayers,
} from "./auth-db.js";
import {
  upsertEntry,
  lockEntry,
  getLatestEntry,
  getEntry,
  listEntries,
} from "./entries-db.js";

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
app.post("/backend/update-team", async (req, res) => {
  try {
    const { code, teamData } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Team code is required" });
    }

    if (!teamData || !teamData.players || teamData.players.length === 0) {
      return res
        .status(400)
        .json({ error: "Team data with players is required" });
    }

    // Verify the team exists
    const user = await findUserByCode(code);
    if (!user) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Update the team data
    await updateTeamPlayers(code, teamData);

    res.json({
      message: "Team updated successfully",
      teamName: user.name,
      playerCount: teamData.players.length,
    });
  } catch (error) {
    console.error("Team update error:", error);
    res.status(500).json({ error: "Failed to update team" });
  }
});

// Entries (team picks by week)
app.get("/backend/entries/latest", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "code is required" });
    const entry = await getLatestEntry(code);
    res.json({ entry });
  } catch (e) {
    console.error("entries latest error:", e);
    res.status(500).json({ error: "Failed to load latest entry" });
  }
});

app.get("/backend/entries/list", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "code is required" });
    const items = await listEntries(code);
    res.json({ items });
  } catch (e) {
    console.error("entries list error:", e);
    res.status(500).json({ error: "Failed to list entries" });
  }
});

app.get("/backend/entries/get", async (req, res) => {
  try {
    const { code, week, year } = req.query;
    if (!code || !week || !year)
      return res.status(400).json({ error: "code, week, year required" });
    const entry = await getEntry(code, Number(week), Number(year));
    res.json({ entry });
  } catch (e) {
    console.error("entries get error:", e);
    res.status(500).json({ error: "Failed to load entry" });
  }
});

app.post("/backend/entries/save", async (req, res) => {
  try {
    const { code, team, week, year, data } = req.body || {};
    if (!code || !team || !week || !year || !data)
      return res
        .status(400)
        .json({ error: "code, team, week, year, data required" });
    try {
      await upsertEntry({ code, team, week, year, data });
    } catch (err) {
      if (err.code === "ENTRY_LOCKED") {
        return res.status(423).json({ error: "Entry is locked" });
      }
      throw err;
    }
    res.json({ ok: true });
  } catch (e) {
    console.error("entries save error:", e);
    res.status(500).json({ error: "Failed to save entry" });
  }
});

app.post("/backend/entries/lock", async (req, res) => {
  try {
    const { code, week, year } = req.body || {};
    if (!code || !week || !year)
      return res.status(400).json({ error: "code, week, year required" });
    await lockEntry({ code, week, year });
    res.json({ ok: true });
  } catch (e) {
    console.error("entries lock error:", e);
    res.status(500).json({ error: "Failed to lock entry" });
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
    let kupong = await loadKupongFromDb(week, year);

    if (kupong) {
      res.json({ kupong });
      return;
    }

    if (day >= 4 && hours >= 12) {
      kupong = await getKupong();
      if (kupong && kupong.length > 0) {
        await saveKupongToDb(kupong, week, year);
        res.json({ kupong });
        return;
      }
    }

    const lastKupong = await getLastEntry();
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

// Use the Render-provided port or 3000 if running locally
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
