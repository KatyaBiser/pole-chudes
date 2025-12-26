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
