import { computeCost } from "../lib/kupong.js";

const COLS = ["1", "X", "2"];

export default function KupongTable({
  matches,
  selections,
  onToggle,
  disabled,
  missingRows,
  onSubmit,
  submitting,
}) {
  const cost = computeCost(selections);

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight text-stone-900">
          Veckans kupong
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs font-medium uppercase tracking-wide text-stone-500">
              <th className="px-5 py-3">Match</th>
              {COLS.map((c) => (
                <th key={c} className="w-14 px-2 py-3 text-center">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matches.map((match, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b border-stone-100 last:border-0 ${
                  missingRows?.has(rowIndex)
                    ? "outline outline-2 -outline-offset-2 outline-red-300"
                    : ""
                }`}
              >
                <td className="whitespace-nowrap px-5 py-2.5 font-medium text-stone-800">
                  {match}
                </td>
                {COLS.map((col) => {
                  const checked = selections[rowIndex]?.includes(col);
                  return (
                    <td key={col} className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        disabled={disabled}
                        aria-pressed={checked}
                        aria-label={`Match ${rowIndex + 1}, ${col}`}
                        onClick={() => onToggle(rowIndex, col)}
                        className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 ${
                          checked
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50"
                        }`}
                      >
                        {checked && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-stone-200 bg-stone-50 px-5 py-4">
        <p className="text-sm text-stone-600">
          Kupongkostnad:{" "}
          <span className="font-semibold text-stone-900">{cost} kr</span>
        </p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || submitting}
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Lämnar in…" : "Lämna in kupong"}
        </button>
      </div>
    </div>
  );
}
