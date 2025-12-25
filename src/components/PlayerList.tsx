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
            className={`p-3 rounded-xl border-2 transition-all duration-300 ${
              player.isEliminated
                ? 'bg-muted/30 border-muted opacity-50'
                : index === currentPlayerIndex
                ? 'bg-accent/20 border-accent ring-2 ring-accent'
                : 'bg-card/50 border-border'
            }`}
          >
            <div className="text-center">
              <p className={`font-bold text-lg mb-1 ${
                player.isEliminated ? 'text-muted-foreground line-through' : 'text-foreground'
              }`}>
                {player.name}
              </p>
              <p className={`text-2xl font-bold ${
                index === currentPlayerIndex ? 'text-accent' : 'text-muted-foreground'
              }`}>
                {player.score}
              </p>
              {player.isEliminated && (
                <span className="text-xs text-destructive">Выбыл</span>
              )}
              {!player.isEliminated && index === currentPlayerIndex && (
                <span className="inline-block mt-1 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                  Ходит!
                </span>
              )}
              {player.consecutiveCorrectGuesses > 0 && !player.isEliminated && (
                <div className="mt-1 text-xs text-secondary">
                  ✓ {player.consecutiveCorrectGuesses} подряд
                </div>
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
