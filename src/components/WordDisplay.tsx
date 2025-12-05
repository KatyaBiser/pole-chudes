interface WordDisplayProps {
  word: string;
  guessedLetters: string[];
  shake: boolean;
}

export function WordDisplay({ word, guessedLetters, shake }: WordDisplayProps) {
  return (
    <div className={`flex flex-wrap justify-center gap-2 md:gap-3 ${shake ? 'animate-shake' : ''}`}>
      {word.split('').map((letter, index) => {
        const isSpace = letter === ' ';
        const isSpecial = letter === '-' || letter === '.' || letter === ',' || letter === '!';
        const isRevealed = guessedLetters.includes(letter.toUpperCase()) || isSpecial;

        if (isSpace) {
          return <div key={index} className="w-4 md:w-6" />;
        }

        return (
          <div
            key={index}
            className={`letter-cell ${isRevealed ? 'revealed animate-bounce-in' : ''}`}
          >
            {isRevealed && (
              <span className="text-accent-foreground">{letter.toUpperCase()}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
