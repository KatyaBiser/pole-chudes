interface GuessedLettersProps {
  letters: string[];
  word: string;
}

export function GuessedLetters({ letters, word }: GuessedLettersProps) {
  if (letters.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground text-center mb-2">
        Уже называли:
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {letters.map((letter, i) => (
          <span
            key={i}
            className={`px-3 py-1 rounded-lg text-sm font-bold ${
              word.includes(letter)
                ? 'bg-secondary/30 text-secondary'
                : 'bg-primary/30 text-primary'
            }`}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
