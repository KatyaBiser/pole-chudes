import { useState, useCallback } from 'react';

export interface GameState {
  words: [string, string, string];
  wordsSaved: [boolean, boolean, boolean];
  currentWordIndex: number | null;
  guessedLetters: string[];
  teamScores: [number, number, number];
  currentTeam: number;
  lastSpinResult: SpinResult | null;
  gamePhase: 'setup' | 'playing' | 'victory';
  isSpinning: boolean;
}

export interface SpinResult {
  type: 'points' | 'skip' | 'bankrupt' | 'prize';
  value: number;
  label: string;
}

const WHEEL_SECTORS: SpinResult[] = [
  { type: 'points', value: 100, label: '+100' },
  { type: 'points', value: 200, label: '+200' },
  { type: 'points', value: 300, label: '+300' },
  { type: 'points', value: 500, label: '+500' },
  { type: 'points', value: 1000, label: '+1000' },
  { type: 'skip', value: 0, label: 'Пропуск хода' },
  { type: 'bankrupt', value: 0, label: 'Банкрот' },
  { type: 'prize', value: 0, label: '🎁 Приз!' },
];

const PRIZES = [
  '13-й мандарин за особые заслуги 🍊',
  'Сертификат на одно объятие от Деда Мороза (без возврата) 🎅',
  'Кружка с надписью "я чудом дожил до этого Нового года" ☕',
  'Бессрочная лицензия на просмотр ёлки соседа 🌲',
  'VIP-доступ к салату Оливье (1 порция) 🥗',
  'Пожизненная подписка на снег, который никогда не выпадет вовремя ❄️',
  'Право не мыть посуду 31 декабря 🍽️',
  'Эксклюзивное место у ёлки для селфи 📸',
  'Один бесплатный "отмаз" от караоке 🎤',
  'Сертификат "Лучший угадыватель букв 2024" 🏆',
];

const SUCCESS_COMMENTS = [
  'Гениально! Прям как Эйнштейн, только в новогодней шапке! 🎓',
  'Вау! Ты видишь буквы насквозь! 👀',
  'Снегурочка аплодирует стоя! 👏',
  'Дед Мороз одобряет! 🎅',
  'Это было... неожиданно умно! 🧠',
  'Ёлочные игрушки засияли от радости! ✨',
];

const FAIL_COMMENTS = [
  'Ой… это было смело, но нет 😅',
  'Буква ушла за шампанским, её нет в слове 🍾',
  'Снегурочка расстроилась и ушла к другой команде 😢',
  'Дед Мороз сделал фейспалм 🤦',
  'Эта буква застряла в пробке на МКАД 🚗',
  'Буква решила отпраздновать Новый год в другом слове 🎉',
  'Мимо! Но мандаринка за старание 🍊',
];

const ALREADY_GUESSED_COMMENTS = [
  'Эй, эта буква уже была! Память как у золотой рыбки? 🐟',
  'Дежавю? Эту букву уже называли! 🔄',
  'Снегурочка записала: эту букву уже проверяли! 📝',
  'Повтор! Дед Мороз начинает нервничать! 😤',
];

export function useGameState() {
  const [state, setState] = useState<GameState>({
    words: ['', '', ''],
    wordsSaved: [false, false, false],
    currentWordIndex: null,
    guessedLetters: [],
    teamScores: [0, 0, 0],
    currentTeam: 0,
    lastSpinResult: null,
    gamePhase: 'setup',
    isSpinning: false,
  });

  const setWord = useCallback((index: number, word: string) => {
    setState(prev => {
      const newWords = [...prev.words] as [string, string, string];
      newWords[index] = word.toUpperCase();
      return { ...prev, words: newWords };
    });
  }, []);

  const saveWord = useCallback((index: number) => {
    setState(prev => {
      const newSaved = [...prev.wordsSaved] as [boolean, boolean, boolean];
      newSaved[index] = true;
      return { ...prev, wordsSaved: newSaved };
    });
  }, []);

  const startRound = useCallback((wordIndex: number) => {
    setState(prev => ({
      ...prev,
      currentWordIndex: wordIndex,
      guessedLetters: [],
      currentTeam: wordIndex,
      gamePhase: 'playing',
      lastSpinResult: null,
    }));
  }, []);

  const spinWheel = useCallback(() => {
    return new Promise<SpinResult>((resolve) => {
      setState(prev => ({ ...prev, isSpinning: true }));
      
      const result = WHEEL_SECTORS[Math.floor(Math.random() * WHEEL_SECTORS.length)];
      
      setTimeout(() => {
        setState(prev => {
          const newScores = [...prev.teamScores] as [number, number, number];
          let newTeam = prev.currentTeam;
          
          if (result.type === 'bankrupt') {
            newScores[prev.currentTeam] = 0;
            newTeam = (prev.currentTeam + 1) % 3;
          } else if (result.type === 'skip') {
            newTeam = (prev.currentTeam + 1) % 3;
          }
          
          return {
            ...prev,
            isSpinning: false,
            lastSpinResult: result,
            teamScores: newScores,
            currentTeam: newTeam,
          };
        });
        resolve(result);
      }, 4000);
    });
  }, []);

  const guessLetter = useCallback((letter: string): { success: boolean; comment: string; alreadyGuessed: boolean } => {
    const normalizedLetter = letter.toUpperCase();
    
    if (state.guessedLetters.includes(normalizedLetter)) {
      return {
        success: false,
        comment: ALREADY_GUESSED_COMMENTS[Math.floor(Math.random() * ALREADY_GUESSED_COMMENTS.length)],
        alreadyGuessed: true,
      };
    }

    const currentWord = state.words[state.currentWordIndex!];
    const isInWord = currentWord.includes(normalizedLetter);
    
    setState(prev => {
      const newGuessedLetters = [...prev.guessedLetters, normalizedLetter];
      const newScores = [...prev.teamScores] as [number, number, number];
      let newTeam = prev.currentTeam;
      
      if (isInWord && prev.lastSpinResult?.type === 'points') {
        const occurrences = currentWord.split(normalizedLetter).length - 1;
        newScores[prev.currentTeam] += prev.lastSpinResult.value * occurrences;
      } else if (!isInWord) {
        newTeam = (prev.currentTeam + 1) % 3;
      }

      // Check for victory
      const allLettersGuessed = currentWord.split('').every(
        char => char === ' ' || char === '-' || newGuessedLetters.includes(char)
      );

      return {
        ...prev,
        guessedLetters: newGuessedLetters,
        teamScores: newScores,
        currentTeam: newTeam,
        lastSpinResult: null,
        gamePhase: allLettersGuessed ? 'victory' : 'playing',
      };
    });

    return {
      success: isInWord,
      comment: isInWord 
        ? SUCCESS_COMMENTS[Math.floor(Math.random() * SUCCESS_COMMENTS.length)]
        : FAIL_COMMENTS[Math.floor(Math.random() * FAIL_COMMENTS.length)],
      alreadyGuessed: false,
    };
  }, [state.guessedLetters, state.words, state.currentWordIndex]);

  const nextTeam = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentTeam: (prev.currentTeam + 1) % 3,
      lastSpinResult: null,
    }));
  }, []);

  const getRandomPrize = useCallback(() => {
    return PRIZES[Math.floor(Math.random() * PRIZES.length)];
  }, []);

  const resetGame = useCallback(() => {
    setState({
      words: ['', '', ''],
      wordsSaved: [false, false, false],
      currentWordIndex: null,
      guessedLetters: [],
      teamScores: [0, 0, 0],
      currentTeam: 0,
      lastSpinResult: null,
      gamePhase: 'setup',
      isSpinning: false,
    });
  }, []);

  const backToSetup = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentWordIndex: null,
      guessedLetters: [],
      lastSpinResult: null,
      gamePhase: 'setup',
    }));
  }, []);

  return {
    state,
    setWord,
    saveWord,
    startRound,
    spinWheel,
    guessLetter,
    nextTeam,
    getRandomPrize,
    resetGame,
    backToSetup,
  };
}
