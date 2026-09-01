export default function EntryControls({
  entries,
  selectedValue,
  onSelectEntry,
  statusText,
  editable,
  canEdit,
  onEditClick,
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
      {statusText && (
        <span className="font-medium text-stone-700">{statusText}</span>
      )}
      <label htmlFor="entry-select" className="text-stone-500">
        Tidigare kuponger:
      </label>
      <select
        id="entry-select"
        value={selectedValue}
        onChange={(e) => onSelectEntry(e.target.value)}
        className="rounded-md border border-stone-300 bg-white px-2 py-1.5"
      >
        <option value="">Aktuell vecka</option>
        {entries.map((entry) => (
          <option key={`${entry.year}-${entry.week}`} value={`${entry.year}-${entry.week}`}>
            v{entry.week} {entry.year}
            {entry.locked ? " (låst)" : ""}
          </option>
        ))}
      </select>
      {!editable && (
        <button
          type="button"
          onClick={onEditClick}
          disabled={!canEdit}
          className="rounded-md border border-stone-300 px-3 py-1.5 font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Redigera
        </button>
      )}
    </div>
  );
}
