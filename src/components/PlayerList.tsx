import { Player } from '@/hooks/useGameState';

interface PlayerListProps {
  players: Player[];
  currentPlayerIndex: number;
  onNextPlayer: () => void;
}

export function PlayerList({ players, currentPlayerIndex, onNextPlayer }: PlayerListProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="grid grid-cols-5 gap-2">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`transition-all duration-300 ${
              player.isEliminated ? 'opacity-50' : ''
            }`}
          >
            {/* Фото */}
            <div className={`rounded-xl overflow-hidden border-2 mb-2 ${
              player.isEliminated
                ? 'border-muted'
                : index === currentPlayerIndex
                ? 'border-accent ring-2 ring-accent'
                : 'border-border'
            }`}>
              <img
                src={player.photo}
                alt={player.name}
                className="w-full aspect-square object-cover"
              />
            </div>
            {/* Имя, очки и статус */}
            <div className="text-center">
              <p className={`font-bold text-sm ${
                player.isEliminated ? 'text-muted-foreground line-through' : 'text-foreground'
              }`}>
                {player.name}
              </p>
              {!player.isEliminated && (
                <p className="text-accent font-bold text-lg">
                  {player.score} <span className="text-xs text-muted-foreground">очков</span>
                </p>
              )}
              {player.isEliminated && (
                <span className="text-xs text-destructive">Выбыл</span>
              )}
              {!player.isEliminated && index === currentPlayerIndex && (
                <span className="inline-block mt-1 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                  Ходит!
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-4">
        <button onClick={onNextPlayer} className="btn-outline text-sm">
          ➡️ Передать ход
        </button>
      </div>
    </div>
  );
}
