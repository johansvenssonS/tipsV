const API_BASE = "https://v3.football.api-sports.io";

function normalize(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function diceCoefficient(a, b) {
  a = normalize(a);
  b = normalize(b);
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const bigrams = (s) => {
    const map = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.substring(i, i + 2);
      map.set(bg, (map.get(bg) || 0) + 1);
    }
    return map;
  };

  const mapA = bigrams(a);
  let intersectionSize = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.substring(i, i + 2);
    const count = mapA.get(bg) || 0;
    if (count > 0) {
      mapA.set(bg, count - 1);
      intersectionSize++;
    }
  }
  return (2 * intersectionSize) / (a.length + b.length - 2);
}

// Same parsing logic as fixData() in src/components/kupong.js
function parseMatchLabel(rawKupongEntry) {
  const str = String(rawKupongEntry).replace(/^\d+\s*/, "");
  const teamNames = str.split("1X2")[0].trim();
  const [home, away] = teamNames.split(" - ").map((s) => (s || "").trim());
  return { label: teamNames, home: home || "", away: away || teamNames };
}

// Fri/Sat/Sun dates (YYYY-MM-DD) for a given ISO week/year, in UTC
export function getIsoWeekDates(week, year) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);

  const toStr = (d) => d.toISOString().slice(0, 10);
  return [4, 5, 6].map((offset) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + offset);
    return toStr(d);
  });
}

export async function fetchFixtures(dateStrings) {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_API_KEY is not configured");
  }

  const results = [];
  for (const date of dateStrings) {
    const res = await fetch(`${API_BASE}/fixtures?date=${date}`, {
      headers: { "x-apisports-key": apiKey },
    });
    if (!res.ok) {
      console.error(`[football-api] fixtures fetch failed for ${date}: ${res.status}`);
      continue;
    }
    const data = await res.json();
    results.push(...(data.response || []));
  }
  return results;
}

const MATCH_THRESHOLD = 0.45;

export function matchAndScore(kupongMatches, fixtures) {
  return kupongMatches.map((raw, i) => {
    const index = i + 1;
    const { label, home, away } = parseMatchLabel(raw);

    let best = null;
    let bestScore = 0;
    for (const fx of fixtures) {
      const fxHome = fx?.teams?.home?.name;
      const fxAway = fx?.teams?.away?.name;
      if (!fxHome || !fxAway) continue;
      const score = (diceCoefficient(home, fxHome) + diceCoefficient(away, fxAway)) / 2;
      if (score > bestScore) {
        bestScore = score;
        best = fx;
      }
    }

    if (!best || bestScore < MATCH_THRESHOLD) {
      return { index, label, outcome: null, homeScore: null, awayScore: null, matched: false };
    }

    const status = best?.fixture?.status?.short;
    const finished = ["FT", "AET", "PEN"].includes(status);
    const homeScore = best?.goals?.home;
    const awayScore = best?.goals?.away;

    if (!finished || homeScore == null || awayScore == null) {
      return { index, label, outcome: null, homeScore: null, awayScore: null, matched: true };
    }

    const outcome = homeScore > awayScore ? "1" : homeScore < awayScore ? "2" : "X";
    return { index, label, outcome, homeScore, awayScore, matched: true };
  });
}

export async function resolveWeekResults(week, year, kupongMatches) {
  const dates = getIsoWeekDates(week, year);
  const fixtures = await fetchFixtures(dates);
  return matchAndScore(kupongMatches, fixtures);
}
