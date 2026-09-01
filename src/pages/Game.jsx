import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast } from "../lib/ToastContext.jsx";
import {
  getKupong,
  loginTeam,
  listEntries,
  getLatestEntry,
  getEntry,
  saveEntry,
} from "../lib/api.js";
import {
  parseMatchName,
  getWeekInfo,
  isCurrentWeek,
  assignGamesToPlayers,
} from "../lib/kupong.js";
import KupongTable from "../components/KupongTable.jsx";
import PlayerCard from "../components/PlayerCard.jsx";
import EntryControls from "../components/EntryControls.jsx";

function selectionsFromEntry(entry, matchCount) {
  const next = Array.from({ length: matchCount }, () => []);
  const kupong = entry?.data?.kupong || [];
  kupong.forEach((row) => {
    const idx = (row.index || 1) - 1;
    if (idx >= 0 && idx < next.length) {
      next[idx] = (row.picks || []).map((p) => p.col);
    }
  });
  return next;
}

export default function Game() {
  const { currentUser, userCode } = useAuth();
  const { showToast } = useToast();
  const nowWeek = useMemo(() => getWeekInfo(new Date()), []);

  const [matches, setMatches] = useState([]);
  const [selections, setSelections] = useState([]);
  const [players, setPlayers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedEntryValue, setSelectedEntryValue] = useState("");
  const [currentEntry, setCurrentEntry] = useState(null);
  const [editable, setEditable] = useState(true);
  const [missingRows, setMissingRows] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const [rawKupong, entryItems] = await Promise.all([
        getKupong(),
        listEntries(userCode),
      ]);
      if (cancelled) return;

      const names = rawKupong.map(parseMatchName);
      setMatches(names);
      setEntries(entryItems);

      const latest = await getLatestEntry(userCode);
      if (cancelled) return;

      if (latest) {
        setCurrentEntry(latest);
        setSelectedEntryValue(`${latest.year}-${latest.week}`);
        setSelections(selectionsFromEntry(latest, names.length));
        setEditable(!latest.locked && isCurrentWeek(latest.week, latest.year));
      } else {
        setSelections(names.map(() => []));
        setEditable(true);
      }
      setLoading(false);

      try {
        const user = await loginTeam(userCode);
        const rosterPlayers = user?.kupong_data?.players || [];
        if (!cancelled && rosterPlayers.length > 0) {
          const seedKey = `${userCode}-${nowWeek.week}-${nowWeek.year}`;
          setPlayers(assignGamesToPlayers(rosterPlayers, names, seedKey));
        }
      } catch {
        // no roster yet — player breakdown stays empty
      }
      if (!cancelled) setLoadingPlayers(false);
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [userCode, nowWeek]);

  async function handleSelectEntry(value) {
    setSelectedEntryValue(value);
    if (!value) {
      const latest = await getLatestEntry(userCode);
      if (latest) {
        setCurrentEntry(latest);
        setSelections(selectionsFromEntry(latest, matches.length));
        setEditable(!latest.locked && isCurrentWeek(latest.week, latest.year));
      } else {
        setCurrentEntry(null);
        setSelections(matches.map(() => []));
        setEditable(true);
      }
      return;
    }
    const [year, week] = value.split("-").map(Number);
    const entry = await getEntry(userCode, week, year);
    if (entry) {
      setCurrentEntry(entry);
      setSelections(selectionsFromEntry(entry, matches.length));
      setEditable(!entry.locked && isCurrentWeek(entry.week, entry.year));
    }
  }

  function toggleCell(rowIndex, col) {
    setSelections((prev) =>
      prev.map((picks, i) => {
        if (i !== rowIndex) return picks;
        return picks.includes(col)
          ? picks.filter((c) => c !== col)
          : [...picks, col];
      })
    );
    setMissingRows((prev) => {
      if (!prev.has(rowIndex)) return prev;
      const next = new Set(prev);
      next.delete(rowIndex);
      return next;
    });
  }

  async function refreshEntries() {
    const [items, latest] = await Promise.all([
      listEntries(userCode),
      getLatestEntry(userCode),
    ]);
    setEntries(items);
    if (latest) {
      setCurrentEntry(latest);
      setSelectedEntryValue(`${latest.year}-${latest.week}`);
      setEditable(!latest.locked && isCurrentWeek(latest.week, latest.year));
    }
  }

  async function handleSubmit() {
    const missing = new Set();
    selections.forEach((picks, i) => {
      if (picks.length === 0) missing.add(i);
    });
    if (missing.size > 0) {
      setMissingRows(missing);
      showToast(`Du måste välja för alla matcher (${missing.size} saknas)`, "error");
      return;
    }

    setSubmitting(true);
    try {
      const kupong = matches.map((match, idx) => ({
        index: idx + 1,
        match,
        picks: selections[idx].map((col) => ({ col, label: col })),
      }));

      const playersPayload = players.map((p) => {
        const indices = new Set(p.assignedGames.map((g) => g.index));
        return {
          name: p.name,
          color: p.color,
          assignedGames: p.assignedGames,
          picks: kupong.filter((k) => indices.has(k.index)),
        };
      });

      await saveEntry({
        code: userCode,
        team: currentUser,
        week: nowWeek.week,
        year: nowWeek.year,
        data: {
          team: currentUser,
          submittedAt: new Date().toISOString(),
          kupong,
          players: playersPayload,
        },
      });

      showToast("Kupongen är inlämnad!", "success");
      await refreshEntries();
    } catch (err) {
      showToast(`Inlämning misslyckades: ${err.message}`, "error");
    } finally {
      setSubmitting(false);
    }
  }

  const canEditCurrentEntry =
    !currentEntry || (!currentEntry.locked && isCurrentWeek(currentEntry.week, currentEntry.year));

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Här lägger ni er kupong
        </h1>
        <p className="mt-2 text-stone-600">Lycka till, {currentUser}!</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr] lg:items-start">
        <div className="order-2 lg:order-1">
          {loadingPlayers ? (
            <div className="space-y-3">
              <div className="h-24 animate-pulse rounded-lg bg-stone-100" />
              <div className="h-24 animate-pulse rounded-lg bg-stone-100" />
            </div>
          ) : players.length > 0 ? (
            <div className="space-y-3">
              {players.map((player) => (
                <PlayerCard key={player.name} player={player} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 px-5 py-8 text-center text-sm text-stone-500">
              Inga spelare tillagda ännu. Lägg till ert lag under{" "}
              <span className="font-medium text-stone-700">Mitt lag</span> för
              att fördela matcherna.
            </div>
          )}
        </div>

        <div className="order-1 space-y-3 lg:sticky lg:top-4 lg:order-2">
          <EntryControls
            entries={entries}
            selectedValue={selectedEntryValue}
            onSelectEntry={handleSelectEntry}
            statusText={
              currentEntry
                ? `v${currentEntry.week} ${currentEntry.year}${
                    currentEntry.locked ? " – Låst" : ""
                  }`
                : `v${nowWeek.week} ${nowWeek.year}`
            }
            editable={editable}
            canEdit={canEditCurrentEntry}
            onEditClick={() => {
              setEditable(true);
              showToast("Redigering aktiverad", "info");
            }}
          />

          {loading ? (
            <div className="h-96 animate-pulse rounded-lg bg-stone-100" />
          ) : (
            <KupongTable
              matches={matches}
              selections={selections}
              onToggle={toggleCell}
              disabled={!editable}
              missingRows={missingRows}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
