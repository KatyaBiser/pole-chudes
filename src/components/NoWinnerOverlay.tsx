interface NoWinnerOverlayProps {
  word: string;
  onNextRound: () => void;
}

export function NoWinnerOverlay({ word, onNextRound }: NoWinnerOverlayProps) {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="text-center animate-bounce-in">
        <div className="text-6xl mb-4">:(</div>
        <h2 className="font-pacifico text-3xl text-destructive mb-4">
          Никто не угадал!
        </h2>
        <p className="text-xl text-foreground mb-6">
          Слово было: <span className="font-bold text-accent">{word}</span>
        </p>
        <button onClick={onNextRound} className="btn-secondary">
          Следующий тур
        </button>
      </div>
    </div>
  );
}
