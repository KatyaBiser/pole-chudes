import { useState } from 'react';

interface LetterInputProps {
  onGuess: (letter: string) => void;
  disabled: boolean;
}

export function LetterInput({ onGuess, disabled }: LetterInputProps) {
  const [letter, setLetter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (letter.trim()) {
      onGuess(letter.trim()[0]);
      setLetter('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <input
        type="text"
        value={letter}
        onChange={(e) => setLetter(e.target.value.slice(-1))}
        placeholder="Введи букву..."
        disabled={disabled}
        maxLength={1}
        className="w-32 px-4 py-3 rounded-xl bg-background/50 border-2 border-accent text-foreground text-center text-2xl font-bold uppercase focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !letter.trim()}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🔍 Проверить!
      </button>
    </form>
  );
}
