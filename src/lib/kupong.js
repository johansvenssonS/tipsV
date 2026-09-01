export const PLAYER_COLORS = [
  "#a83a30",
  "#3f6b52",
  "#3a5a8c",
  "#8c6a3a",
  "#6a4c8c",
  "#2f7a7a",
  "#8c3a5e",
  "#5a7a2f",
  "#7a4c2f",
  "#4c5a8c",
];

export function parseMatchName(raw) {
  const str = String(raw).replace(/^\d+\s*/, "");
  const teamNames = str.split("1X2")[0].trim();
  return teamNames;
}

export function computeCost(selections) {
  return selections.reduce((product, picks) => {
    const count = picks.length;
    const factor = count === 0 ? 1 : 2 ** (count - 1);
    return product * factor;
  }, 1);
}

export function getWeekInfo(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

export function isCurrentWeek(week, year) {
  const cur = getWeekInfo(new Date());
  return cur.week === Number(week) && cur.year === Number(year);
}

// Simple deterministic string hash -> seed for a small PRNG, so the same
// team/week always produces the same match distribution instead of
// reshuffling on every reload.
function hashSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function assignGamesToPlayers(players, matchNames, seedKey) {
  const totalMatches = matchNames.length;
  const totalPlayers = players.length;
  if (totalPlayers === 0) return [];

  const matchesPerPlayer = Math.floor(totalMatches / totalPlayers);
  const extraMatches = totalMatches % totalPlayers;

  const rand = mulberry32(hashSeed(seedKey));
  const order = Array.from({ length: totalMatches }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  let cursor = 0;
  return players.map((player, playerIndex) => {
    const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
    const playerMatches = matchesPerPlayer + (playerIndex < extraMatches ? 1 : 0);
    const assignedGames = [];
    for (let i = 0; i < playerMatches && cursor < order.length; i++, cursor++) {
      const gameIndex = order[cursor];
      assignedGames.push({ name: matchNames[gameIndex], index: gameIndex + 1 });
    }
    return { ...player, color, assignedGames };
  });
}
