interface MustGuessWarningProps {
  onGuessWord: () => void;
  onEliminate: () => void;
}

export function MustGuessWarning({ onGuessWord, onEliminate }: MustGuessWarningProps) {
  return (
    <div className="bg-destructive/20 border border-destructive rounded-xl p-4 mb-6 text-center animate-pulse">
      <p className="text-destructive font-bold text-lg">
        Правило 3 ходов! Ты должен назвать слово или выбываешь!
      </p>
      <div className="flex gap-4 justify-center mt-3">
        <button onClick={onGuessWord} className="btn-primary">
          Назвать слово
        </button>
        <button onClick={onEliminate} className="btn-outline text-destructive border-destructive">
          Выбыть
        </button>
      </div>
    </div>
  );
}
