import "dotenv/config";
import express from "express";
import cors from "cors";
import getKupong from "./puppeteer.js";
import { saveKupongToDb, loadKupongFromDb } from "./kupong-db.js";

const app = express();
const allowedOrigins = [
  "https://johansvenssons.github.io",
  "http://127.0.0.1:3000",
];
app.use(cors({ origin: allowedOrigins }));

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

// /kupong endpoint
app.get("/kupong", async (req, res) => {
  const today = new Date();
  const week = getWeekNumber(today);
  const year = today.getFullYear();

  try {
    let kupong = await loadKupongFromDb(week, year);
    if (!kupong) {
      kupong = await getKupong();
      if (kupong) {
        await saveKupongToDb(kupong, week, year);
        res.json({ kupong });
      } else {
        res.status(500).json({ error: "Kunde inte hämta kupongen" });
      }
    } else {
      res.json({ kupong });
    }
  } catch (error) {
    console.error("kupong error:", error);
    res.status(500).json({
      error: "Något gick fel vid hämtning av kupong",
      details: error.message || String(error),
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
