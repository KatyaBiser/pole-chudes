export function normalizeLetter(letter: string): string {
  const upper = letter.toUpperCase();
  if (upper === 'Ё') return 'Е';
  if (upper === 'Й') return 'И';
  return upper;
}

export function normalizeWord(word: string): string {
  return word.split('').map(normalizeLetter).join('');
}

export function checkWordComplete(word: string, guessedLetters: string[]): boolean {
  const normalizedWord = normalizeWord(word);
  return normalizedWord.split('').every(
    char => char === ' ' || char === '-' || guessedLetters.includes(normalizeLetter(char))
  );
}

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Fisher-Yates shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
