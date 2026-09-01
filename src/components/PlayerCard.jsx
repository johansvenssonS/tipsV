export default function PlayerCard({ player }) {
  return (
    <div
      className="rounded-lg border border-stone-200 bg-white transition-shadow hover:shadow-sm"
      style={{ borderLeftColor: player.color, borderLeftWidth: 4 }}
    >
      <div className="flex items-baseline justify-between px-4 py-3">
        <h3 className="font-semibold" style={{ color: player.color }}>
          {player.name}
        </h3>
        <span className="text-xs text-stone-500">
          {player.assignedGames.length} matcher
        </span>
      </div>
      <ul className="border-t border-stone-100 px-4 py-3">
        {player.assignedGames.map((game) => (
          <li
            key={game.index}
            className="flex gap-2 border-b border-stone-50 py-1.5 text-sm last:border-0"
          >
            <span className="font-medium text-stone-400">{game.index}.</span>
            <span className="text-stone-700">{game.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
