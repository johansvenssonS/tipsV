import { API_BASE } from "./config.js";

async function parseJson(res) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function loginTeam(code) {
  const res = await fetch(`${API_BASE}/backend/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error("Ogiltig lagkod");
  return parseJson(res);
}

export async function registerTeam(name) {
  const res = await fetch(`${API_BASE}/backend/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Registreringen misslyckades");
  return parseJson(res);
}

export async function updateTeam(code, teamData) {
  const res = await fetch(`${API_BASE}/backend/update-team`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, teamData }),
  });
  if (!res.ok) throw new Error("Kunde inte spara laguppställning");
  return parseJson(res);
}

export async function getKupong() {
  const res = await fetch(`${API_BASE}/kupong`);
  const data = await parseJson(res);
  return data?.kupong || [];
}

export async function listEntries(code) {
  const res = await fetch(
    `${API_BASE}/backend/entries/list?code=${encodeURIComponent(code)}`
  );
  const data = await parseJson(res);
  return data?.data?.items || [];
}

export async function getLatestEntry(code) {
  const res = await fetch(
    `${API_BASE}/backend/entries/latest?code=${encodeURIComponent(code)}`
  );
  const data = await parseJson(res);
  return data?.data?.entry || null;
}

export async function getEntry(code, week, year) {
  const res = await fetch(
    `${API_BASE}/backend/entries/get?code=${encodeURIComponent(
      code
    )}&week=${week}&year=${year}`
  );
  const data = await parseJson(res);
  return data?.data?.entry || null;
}

export async function saveEntry(payload) {
  const res = await fetch(`${API_BASE}/backend/entries/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Inlämning misslyckades (${res.status}): ${text}`);
  }
  return parseJson(res);
}
