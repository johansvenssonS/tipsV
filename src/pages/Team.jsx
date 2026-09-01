import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast } from "../lib/ToastContext.jsx";
import { loginTeam, updateTeam } from "../lib/api.js";
import { asset } from "../lib/asset.js";

export default function Team() {
  const { currentUser, userCode } = useAuth();
  const { showToast } = useToast();

  const [players, setPlayers] = useState([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadRoster() {
      try {
        const user = await loginTeam(userCode);
        if (!cancelled && user?.kupong_data?.players) {
          setPlayers(user.kupong_data.players);
        }
      } catch {
        // No saved roster yet is not an error state — start from empty.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRoster();
    return () => {
      cancelled = true;
    };
  }, [userCode]);

  function addPlayer(e) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setPlayers((prev) => [...prev, { id: Date.now(), name: trimmed }]);
    setNewName("");
    setError("");
  }

  function removePlayer(id) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSubmit() {
    if (players.length === 0) {
      setError("Lägg till minst en spelare innan du sparar.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const teamData = {
        players,
        playerCount: players.length,
        submittedAt: new Date().toISOString(),
      };
      const result = await updateTeam(userCode, teamData);
      showToast(
        `Laguppställning sparad — ${result?.playerCount ?? players.length} spelare.`,
        "success"
      );
    } catch {
      showToast("Kunde inte spara laguppställningen. Försök igen.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[2fr_3fr]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Mitt lag: {currentUser}
          </h1>
          <p className="mt-3 text-stone-600">
            Lägg till spelarna i laget här. Ni kan komma tillbaka och ändra
            listan när som helst — matcherna fördelas mellan de spelare som
            står med.
          </p>
          <div className="mt-8 hidden aspect-square items-center justify-center rounded-lg bg-stone-100 p-10 md:flex">
            <img
              src={asset("static/icons/taktiktavla.png")}
              alt="Taktiktavla"
              className="w-full max-w-[180px] object-contain"
            />
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-stone-700">Spelare</h2>
            <span className="text-sm text-stone-500">
              {players.length} spelare
            </span>
          </div>

          {loading ? (
            <div className="mt-4 space-y-2">
              <div className="h-10 animate-pulse rounded-md bg-stone-100" />
              <div className="h-10 animate-pulse rounded-md bg-stone-100" />
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between rounded-md border border-stone-200 px-3 py-2"
                >
                  <span className="text-stone-800">{player.name}</span>
                  <button
                    type="button"
                    onClick={() => removePlayer(player.id)}
                    aria-label={`Ta bort ${player.name}`}
                    className="rounded-md px-2 py-1 text-sm text-stone-400 transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    Ta bort
                  </button>
                </li>
              ))}
              {players.length === 0 && (
                <li className="rounded-md border border-dashed border-stone-300 px-3 py-4 text-center text-sm text-stone-500">
                  Inga spelare tillagda ännu.
                </li>
              )}
            </ul>
          )}

          <form onSubmit={addPlayer} className="mt-4 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Spelarens namn"
              className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-stone-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="submit"
              className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
            >
              Lägg till
            </button>
          </form>

          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || loading}
            className="mt-5 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Sparar…" : "Spara laguppställning"}
          </button>
        </div>
      </div>
    </div>
  );
}
