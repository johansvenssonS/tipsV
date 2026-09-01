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
import {
  upsertResults,
  getResults,
  setResultOverride,
} from "./results-db.js";
import { resolveWeekResults } from "./football-api.js";

const app = express();
const allowedOrigins = [
  "https://johansvenssons.github.io",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://localhost:3001",
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

function getSwedenTime() {
  const now = new Date();
  return new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Stockholm" })
  );
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

// Results (actual match outcomes, matched against a saved kupong)
app.get("/backend/results", async (req, res) => {
  try {
    const week = Number(req.query.week);
    const year = Number(req.query.year);
    if (!week || !year)
      return res.status(400).json({ error: "week, year required" });

    let results = await getResults(week, year);
    const isComplete = results.length === 13 && results.every((r) => r.outcome);

    if (!isComplete) {
      const sweden = getSwedenTime();
      const day = sweden.getDay(); // 0=Sun, 1=Mon, 5=Fri, 6=Sat
      const inResultsWindow = day === 5 || day === 6 || day === 0 || day === 1;

      if (inResultsWindow) {
        const kupongMatches = await loadKupongFromDb(week, year);
        if (kupongMatches) {
          try {
            const fresh = await resolveWeekResults(week, year, kupongMatches);
            await upsertResults({ week, year, results: fresh });
            results = await getResults(week, year);
          } catch (err) {
            console.error("[/backend/results] fetch failed:", err.message);
          }
        }
      }
    }

    res.json({ results });
  } catch (e) {
    console.error("results error:", e);
    res.status(500).json({ error: "Failed to load results" });
  }
});

app.post("/backend/results/override", async (req, res) => {
  try {
    const { week, year, matchIndex, outcome } = req.body || {};
    if (!week || !year || !matchIndex || !outcome)
      return res
        .status(400)
        .json({ error: "week, year, matchIndex, outcome required" });

    await setResultOverride({
      week: Number(week),
      year: Number(year),
      matchIndex: Number(matchIndex),
      outcome,
    });
    res.json({ ok: true });
  } catch (e) {
    if (e.code === "INVALID_OUTCOME") {
      return res.status(400).json({ error: e.message });
    }
    console.error("results override error:", e);
    res.status(500).json({ error: "Failed to override result" });
  }
});

// Scoreboard: one team's picks for a week, scored against results
app.get("/backend/scoreboard", async (req, res) => {
  try {
    const { code } = req.query;
    const week = Number(req.query.week);
    const year = Number(req.query.year);
    if (!code || !week || !year)
      return res.status(400).json({ error: "code, week, year required" });

    const entry = await getEntry(code, week, year);
    if (!entry) return res.json({ scoreboard: null });

    const results = await getResults(week, year);
    const outcomeByIndex = new Map(results.map((r) => [r.index, r]));

    const matches = (entry.data.kupong || []).map((m) => {
      const r = outcomeByIndex.get(m.index);
      const resolved = !!(r && r.outcome);
      const correct = resolved && (m.picks || []).some((p) => p.col === r.outcome);
      return {
        index: m.index,
        match: m.match,
        outcome: r?.outcome ?? null,
        resolved,
        correct,
      };
    });

    const totalResolved = matches.filter((m) => m.resolved).length;
    const totalCorrect = matches.filter((m) => m.correct).length;

    const players = (entry.data.players || []).map((p) => {
      const assignedIndices = (p.assignedGames || []).map((g) => g.index);
      const assignedMatches = matches.filter((m) =>
        assignedIndices.includes(m.index)
      );
      return {
        name: p.name,
        color: p.color,
        assignedCount: assignedIndices.length,
        resolvedCount: assignedMatches.filter((m) => m.resolved).length,
        correctCount: assignedMatches.filter((m) => m.correct).length,
      };
    });

    res.json({
      scoreboard: {
        team: entry.team,
        week,
        year,
        totalResolved,
        totalCorrect,
        matches,
        players,
      },
    });
  } catch (e) {
    console.error("scoreboard error:", e);
    res.status(500).json({ error: "Failed to load scoreboard" });
  }
});

// Leaderboard: per-player totals across all of a team's saved weeks
app.get("/backend/leaderboard", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "code is required" });

    const items = await listEntries(code);
    const byPlayer = new Map();

    for (const item of items) {
      const entry = await getEntry(code, item.week, item.year);
      if (!entry) continue;
      const results = await getResults(item.week, item.year);
      const outcomeByIndex = new Map(results.map((r) => [r.index, r]));

      for (const p of entry.data.players || []) {
        const stats = byPlayer.get(p.name) || {
          name: p.name,
          color: p.color,
          totalCorrect: 0,
          totalResolved: 0,
          weeksPlayed: 0,
        };

        const assignedGames = p.assignedGames || [];
        if (assignedGames.length > 0) {
          stats.weeksPlayed++;
        }

        for (const g of assignedGames) {
          const r = outcomeByIndex.get(g.index);
          if (r && r.outcome) {
            stats.totalResolved++;
            const match = (entry.data.kupong || []).find(
              (m) => m.index === g.index
            );
            const correct = (match?.picks || []).some(
              (pick) => pick.col === r.outcome
            );
            if (correct) stats.totalCorrect++;
          }
        }

        byPlayer.set(p.name, stats);
      }
    }

    const leaderboard = Array.from(byPlayer.values())
      .map((s) => ({
        ...s,
        average: s.totalResolved ? s.totalCorrect / s.totalResolved : 0,
      }))
      .sort((a, b) => b.totalCorrect - a.totalCorrect || b.average - a.average);

    res.json({ leaderboard });
  } catch (e) {
    console.error("leaderboard error:", e);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

// /kupong endpoint
app.get("/kupong", async (req, res) => {
  // Use Swedish time (UTC+1) for scraping window logic
  const now = new Date();
  const swedenTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Stockholm" })
  );
  const week = getWeekNumber(swedenTime);
  const year = swedenTime.getFullYear();
  const day = swedenTime.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const hours = swedenTime.getHours();

  try {
    console.log(
      `[/kupong] Checking week ${week}/${year}, day=${day}, hour=${hours} (Sweden time)`
    );

    // Check if we already have data for this week
    let kupong = await loadKupongFromDb(week, year);

    if (kupong) {
      console.log(
        `[/kupong] ✅ Found week ${week}/${year} in DB - using cached data`
      );
      res.json({ kupong });
      return;
    }

    console.log(`[/kupong] No data for week ${week}/${year} in DB`);

    // Scraping window: Thursday 12:00 - Saturday 18:00
    const inScrapingWindow =
      (day === 4 && hours >= 12) || // Thursday from noon onwards
      day === 5 || // Friday (all day)
      (day === 6 && hours < 18); // Saturday until 18:00

    if (inScrapingWindow) {
      console.log(
        `[/kupong] ✅ In scraping window (Thu 12:00 - Sat 18:00), attempting scrape...`
      );
      kupong = await getKupong();

      if (kupong && kupong.length > 0) {
        console.log(
          `[/kupong] 🎉 Scrape successful! Got ${kupong.length} matches`
        );
        await saveKupongToDb(kupong, week, year);
        res.json({ kupong });
        return;
      } else {
        console.warn(`[/kupong] ❌ SCRAPE FAILED or returned empty array`);
      }
    } else {
      console.log(
        `[/kupong] ⏰ Outside scraping window (need Thu 12:00 - Sat 18:00)`
      );
    }

    console.log(`[/kupong] 📁 Falling back to last entry from DB`);
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

// Use the Render-provided port or 3001 if running locally
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on port ${PORT}`);
});
