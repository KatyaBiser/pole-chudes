interface WordDisplayProps {
  word: string;
  guessedLetters: string[];
  shake: boolean;
  clickable?: boolean;
  onLetterClick?: (letter: string) => void;
}

export function WordDisplay({ word, guessedLetters, shake, clickable, onLetterClick }: WordDisplayProps) {
  return (
    <div className={`flex flex-wrap justify-center gap-2 md:gap-3 ${shake ? 'animate-shake' : ''}`}>
      {word.split('').map((letter, index) => {
        const isSpace = letter === ' ';
        const isSpecial = letter === '-' || letter === '.' || letter === ',' || letter === '!';
        const isRevealed = guessedLetters.includes(letter.toUpperCase()) || isSpecial;
        const canClick = clickable && !isRevealed && !isSpace && onLetterClick;

        if (isSpace) {
          return <div key={index} className="w-4 md:w-6" />;
        }

        return (
          <div
            key={index}
            onClick={canClick ? () => onLetterClick(letter.toUpperCase()) : undefined}
            className={`letter-cell ${isRevealed ? 'revealed animate-bounce-in' : ''} ${
              canClick ? 'cursor-pointer hover:bg-accent/30 hover:border-accent hover:scale-110 transition-all' : ''
            }`}
          >
            {isRevealed && (
              <span className="text-accent-foreground">{letter.toUpperCase()}</span>
            )}
            {canClick && (
              <span className="text-accent/50 text-2xl">?</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
