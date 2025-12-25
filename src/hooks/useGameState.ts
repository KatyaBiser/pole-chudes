import { useState, useCallback } from 'react';

export interface Player {
  id: number;
  name: string;
  photo: string;
  score: number;
  isEliminated: boolean;
  consecutiveCorrectGuesses: number; // для правила 3 результативных ходов
}

export interface Round {
  word: string;
  hint: string;
  players: Player[];
  currentPlayerIndex: number;
  guessedLetters: string[];
  isComplete: boolean;
  winnerId: number | null;
}

export interface GameState {
  phase: 'setup' | 'qualifying1' | 'qualifying2' | 'qualifying3' | 'gameover';
  rounds: Round[];
  currentRoundIndex: number;
  lastSpinResult: SpinResult | null;
  isSpinning: boolean;
  mustGuessWord: boolean;
  doubleMultiplierUsed: number;
  hasChanceBonus: boolean;
  pendingPrizeChoice: boolean;
}

export interface SpinResult {
  type: 'points' | 'bankrupt' | 'zero' | 'prize' | 'plus' | 'double' | 'chance';
  value: number;
  label: string;
}

const WHEEL_SECTORS: SpinResult[] = [
  { type: 'points', value: 50, label: '50' },
  { type: 'points', value: 100, label: '100' },
  { type: 'points', value: 150, label: '150' },
  { type: 'points', value: 200, label: '200' },
  { type: 'points', value: 250, label: '250' },
  { type: 'points', value: 300, label: '300' },
  { type: 'points', value: 500, label: '500' },
  { type: 'points', value: 1000, label: '1000' },
  { type: 'bankrupt', value: 0, label: 'БАНКРОТ' },
  { type: 'zero', value: 0, label: '0' },
  { type: 'prize', value: 0, label: 'ПРИЗ 🎁' },
  { type: 'plus', value: 0, label: '+ БУКВА' },
  { type: 'double', value: 0, label: 'x2' },
  { type: 'chance', value: 0, label: 'ШАНС' },
];

const PRIZES = [
  '13-й мандарин за особые заслуги 🍊',
  'Сертификат на одно объятие от Деда Мороза 🎅',
  'Кружка "я чудом дожил до этого Нового года" ☕',
  'Бессрочная лицензия на просмотр ёлки соседа 🌲',
  'VIP-доступ к салату Оливье (1 порция) 🥗',
  'Пожизненная подписка на снег ❄️',
  'Право не мыть посуду 31 декабря 🍽️',
  'Эксклюзивное место у ёлки для селфи 📸',
  'Сертификат "Лучший угадыватель 2024" 🏆',
  'Бутылка шампанского (виртуальная) 🍾',
];

const SUCCESS_COMMENTS = [
  'Гениально! Прям как Эйнштейн в новогодней шапке! 🎓',
  'Вау! Ты видишь буквы насквозь! 👀',
  'Снегурочка аплодирует стоя! 👏',
  'Дед Мороз одобряет! 🎅',
  'Это было... неожиданно умно! 🧠',
  'Ёлочные игрушки засияли от радости! ✨',
  'Браво! Так держать! 🎉',
];

const FAIL_COMMENTS = [
  'Ой… это было смело, но нет 😅',
  'Буква ушла за шампанским 🍾',
  'Снегурочка ушла к другой команде 😢',
  'Дед Мороз сделал фейспалм 🤦',
  'Эта буква застряла в пробке 🚗',
  'Буква празднует в другом слове 🎉',
  'Мимо! Но мандаринка за старание 🍊',
];

const WRONG_WORD_COMMENTS = [
  'Увы! Это было не то слово... Ты выбываешь 😔',
  'Не угадал! Прощай, друг, увидимся в следующем году! 👋',
  'Слово было другим... Ты покидаешь раунд! 💔',
];

const ALREADY_GUESSED_COMMENTS = [
  'Эта буква уже была! Память как у рыбки? 🐟',
  'Дежавю? Эту букву уже называли! 🔄',
  'Повтор! Дед Мороз нервничает! 😤',
];

// Нормализация буквы (Ё=Е, Й=И)
function normalizeLetter(letter: string): string {
  const upper = letter.toUpperCase();
  if (upper === 'Ё') return 'Е';
  if (upper === 'Й') return 'И';
  return upper;
}

function normalizeWord(word: string): string {
  return word.split('').map(normalizeLetter).join('');
}

const createInitialState = (): GameState => ({
  phase: 'setup',
  rounds: [],
  currentRoundIndex: 0,
  lastSpinResult: null,
  isSpinning: false,
  mustGuessWord: false,
  doubleMultiplierUsed: 0,
  hasChanceBonus: false,
  pendingPrizeChoice: false,
});

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState());

  const getCurrentRound = useCallback(() => {
    return state.rounds[state.currentRoundIndex];
  }, [state.rounds, state.currentRoundIndex]);

  const getCurrentPlayer = useCallback(() => {
    const round = getCurrentRound();
    if (!round) return null;
    return round.players[round.currentPlayerIndex];
  }, [getCurrentRound]);

  const getActivePlayers = useCallback(() => {
    const round = getCurrentRound();
    if (!round) return [];
    return round.players.filter(p => !p.isEliminated);
  }, [getCurrentRound]);

  // Настройка игры - добавление раундов
  const setupGame = useCallback((roundsData: { word: string; hint: string; players: { name: string; photo: string }[] }[]) => {
    const rounds: Round[] = roundsData.map((data, roundIndex) => ({
      word: data.word.toUpperCase(),
      hint: data.hint,
      players: data.players.map((player, i) => ({
        id: roundIndex * 10 + i,
        name: player.name,
        photo: player.photo,
        score: 0,
        isEliminated: false,
        consecutiveCorrectGuesses: 0,
      })),
      currentPlayerIndex: 0,
      guessedLetters: [],
      isComplete: false,
      winnerId: null,
    }));

    setState(prev => ({
      ...prev,
      phase: 'qualifying1',
      rounds,
      currentRoundIndex: 0,
    }));
  }, []);

  // Переход к следующему активному игроку
  const nextPlayer = useCallback(() => {
    setState(prev => {
      const round = { ...prev.rounds[prev.currentRoundIndex] };
      const activePlayers = round.players.filter(p => !p.isEliminated);
      
      if (activePlayers.length === 0) {
        // Никто не остался - раунд завершён без победителя
        round.isComplete = true;
        const newRounds = [...prev.rounds];
        newRounds[prev.currentRoundIndex] = round;
        return { ...prev, rounds: newRounds };
      }

      let nextIndex = (round.currentPlayerIndex + 1) % round.players.length;
      while (round.players[nextIndex].isEliminated) {
        nextIndex = (nextIndex + 1) % round.players.length;
      }
      
      round.currentPlayerIndex = nextIndex;
      const newRounds = [...prev.rounds];
      newRounds[prev.currentRoundIndex] = round;
      
      return {
        ...prev,
        rounds: newRounds,
        lastSpinResult: null,
        mustGuessWord: false,
        hasChanceBonus: false,
      };
    });
  }, []);

  // Крутить барабан
  const spinWheel = useCallback(() => {
    return new Promise<SpinResult>((resolve) => {
      setState(prev => ({ ...prev, isSpinning: true }));
      
      const result = WHEEL_SECTORS[Math.floor(Math.random() * WHEEL_SECTORS.length)];
      
      setTimeout(() => {
        setState(prev => {
          let newState = {
            ...prev,
            isSpinning: false,
            lastSpinResult: result,
          };

          const round = { ...prev.rounds[prev.currentRoundIndex] };
          const playerIndex = round.currentPlayerIndex;
          const players = [...round.players];
          const player = { ...players[playerIndex] };

          if (result.type === 'bankrupt') {
            // Банкрот - теряем все очки, ход переходит
            player.score = 0;
            player.consecutiveCorrectGuesses = 0;
            players[playerIndex] = player;
            round.players = players;
            round.currentPlayerIndex = getNextActivePlayerIndex(round);
            
            const newRounds = [...prev.rounds];
            newRounds[prev.currentRoundIndex] = round;
            newState = { ...newState, rounds: newRounds };
          } else if (result.type === 'zero') {
            // Ноль - сохраняем очки, но ход переходит
            player.consecutiveCorrectGuesses = 0;
            players[playerIndex] = player;
            round.players = players;
            round.currentPlayerIndex = getNextActivePlayerIndex(round);
            
            const newRounds = [...prev.rounds];
            newRounds[prev.currentRoundIndex] = round;
            newState = { ...newState, rounds: newRounds };
          } else if (result.type === 'prize') {
            // Приз - ждём выбора игрока
            newState.pendingPrizeChoice = true;
          } else if (result.type === 'chance') {
            // Шанс - может назвать 2 буквы
            newState.hasChanceBonus = true;
          } else if (result.type === 'double') {
            // Удвоитель
            if (prev.doubleMultiplierUsed >= 2) {
              // Уже использован 2 раза - даём 300 очков
              newState.lastSpinResult = { type: 'points', value: 300, label: '300 (вместо x2)' };
            } else {
              newState.doubleMultiplierUsed = prev.doubleMultiplierUsed + 1;
              // Удвоитель применится при угадывании буквы
            }
          }
          
          return newState;
        });
        resolve(result);
      }, 4000);
    });
  }, []);

  // Получить индекс следующего активного игрока
  const getNextActivePlayerIndex = (round: Round): number => {
    const activePlayers = round.players.filter(p => !p.isEliminated);
    if (activePlayers.length === 0) return round.currentPlayerIndex;
    
    let nextIndex = (round.currentPlayerIndex + 1) % round.players.length;
    while (round.players[nextIndex].isEliminated) {
      nextIndex = (nextIndex + 1) % round.players.length;
    }
    return nextIndex;
  };

  // Выбор по сектору "Приз"
  const handlePrizeChoice = useCallback((takePrize: boolean) => {
    setState(prev => {
      if (takePrize) {
        // Берём приз и выходим из раунда
        const round = { ...prev.rounds[prev.currentRoundIndex] };
        const players = [...round.players];
        players[round.currentPlayerIndex] = {
          ...players[round.currentPlayerIndex],
          isEliminated: true,
        };
        round.players = players;
        round.currentPlayerIndex = getNextActivePlayerIndex(round);
        
        const newRounds = [...prev.rounds];
        newRounds[prev.currentRoundIndex] = round;
        
        return {
          ...prev,
          rounds: newRounds,
          pendingPrizeChoice: false,
          lastSpinResult: null,
        };
      } else {
        // Отказываемся от приза, продолжаем играть
        return {
          ...prev,
          pendingPrizeChoice: false,
          lastSpinResult: { type: 'points', value: 100, label: '+100 (вместо приза)' },
        };
      }
    });
  }, []);

  // Использовать "+" (открыть любую букву)
  const usePlusToOpenLetter = useCallback((letter: string) => {
    const normalizedLetter = normalizeLetter(letter);
    
    setState(prev => {
      const round = { ...prev.rounds[prev.currentRoundIndex] };
      
      if (!round.word.includes(normalizedLetter) || round.guessedLetters.includes(normalizedLetter)) {
        return prev; // Буквы нет или уже открыта
      }
      
      round.guessedLetters = [...round.guessedLetters, normalizedLetter];
      
      // Проверяем победу
      const isWordComplete = checkWordComplete(round.word, round.guessedLetters);
      if (isWordComplete) {
        round.isComplete = true;
        round.winnerId = round.players[round.currentPlayerIndex].id;
      }
      
      const newRounds = [...prev.rounds];
      newRounds[prev.currentRoundIndex] = round;
      
      return {
        ...prev,
        rounds: newRounds,
        lastSpinResult: null,
      };
    });
    
    return { success: true, comment: 'Буква открыта с помощью сектора "+"! ✨' };
  }, []);

  // Угадать букву
  const guessLetter = useCallback((letter: string): { 
    success: boolean; 
    comment: string; 
    alreadyGuessed: boolean;
    count: number;
  } => {
    const normalizedLetter = normalizeLetter(letter);
    
    const round = getCurrentRound();
    if (!round) {
      return { success: false, comment: 'Ошибка!', alreadyGuessed: false, count: 0 };
    }
    
    // Проверка на уже названную букву
    if (round.guessedLetters.includes(normalizedLetter)) {
      // Переход хода при повторе
      nextPlayer();
      return {
        success: false,
        comment: ALREADY_GUESSED_COMMENTS[Math.floor(Math.random() * ALREADY_GUESSED_COMMENTS.length)],
        alreadyGuessed: true,
        count: 0,
      };
    }
    
    const normalizedWord = normalizeWord(round.word);
    const letterCount = normalizedWord.split(normalizedLetter).length - 1;
    const isInWord = letterCount > 0;
    
    setState(prev => {
      const round = { ...prev.rounds[prev.currentRoundIndex] };
      const players = [...round.players];
      const playerIndex = round.currentPlayerIndex;
      const player = { ...players[playerIndex] };
      
      round.guessedLetters = [...round.guessedLetters, normalizedLetter];
      
      if (isInWord) {
        // Буква есть - начисляем очки
        let points = (prev.lastSpinResult?.value || 0) * letterCount;
        
        // Применяем удвоитель если был выбран
        if (prev.lastSpinResult?.type === 'double') {
          points = points * 2;
        }
        
        player.score += points;
        player.consecutiveCorrectGuesses += 1;
        
        // Проверяем правило 3 результативных ходов (если остался 1 игрок)
        const activePlayers = players.filter(p => !p.isEliminated);
        const mustGuess = activePlayers.length === 1 && player.consecutiveCorrectGuesses >= 3;
        
        players[playerIndex] = player;
        round.players = players;
        
        // Проверяем победу
        const isWordComplete = checkWordComplete(round.word, round.guessedLetters);
        if (isWordComplete) {
          round.isComplete = true;
          round.winnerId = player.id;
        }
        
        const newRounds = [...prev.rounds];
        newRounds[prev.currentRoundIndex] = round;
        
        return {
          ...prev,
          rounds: newRounds,
          lastSpinResult: null,
          mustGuessWord: mustGuess,
        };
      } else {
        // Буквы нет - ход переходит
        player.consecutiveCorrectGuesses = 0;
        players[playerIndex] = player;
        round.players = players;
        round.currentPlayerIndex = getNextActivePlayerIndex(round);
        
        const newRounds = [...prev.rounds];
        newRounds[prev.currentRoundIndex] = round;
        
        return {
          ...prev,
          rounds: newRounds,
          lastSpinResult: null,
          mustGuessWord: false,
        };
      }
    });
    
    return {
      success: isInWord,
      comment: isInWord
        ? SUCCESS_COMMENTS[Math.floor(Math.random() * SUCCESS_COMMENTS.length)]
        : FAIL_COMMENTS[Math.floor(Math.random() * FAIL_COMMENTS.length)],
      alreadyGuessed: false,
      count: letterCount,
    };
  }, [getCurrentRound, nextPlayer]);

  // Назвать слово целиком
  const guessWord = useCallback((word: string): { success: boolean; comment: string } => {
    const normalizedGuess = normalizeWord(word.toUpperCase().trim());
    const round = getCurrentRound();
    if (!round) return { success: false, comment: 'Ошибка!' };
    
    const normalizedWord = normalizeWord(round.word);
    const isCorrect = normalizedGuess === normalizedWord;
    
    setState(prev => {
      const round = { ...prev.rounds[prev.currentRoundIndex] };
      const players = [...round.players];
      const playerIndex = round.currentPlayerIndex;
      
      if (isCorrect) {
        // Верно - игрок побеждает в раунде
        round.isComplete = true;
        round.winnerId = players[playerIndex].id;
        // Открываем все буквы
        round.guessedLetters = round.word.split('').filter(c => c !== ' ' && c !== '-');
      } else {
        // Неверно - игрок выбывает
        players[playerIndex] = {
          ...players[playerIndex],
          isEliminated: true,
        };
        round.players = players;
        
        // Проверяем остались ли игроки
        const activePlayers = players.filter(p => !p.isEliminated);
        if (activePlayers.length === 0) {
          round.isComplete = true;
        } else {
          round.currentPlayerIndex = getNextActivePlayerIndex(round);
        }
      }
      
      const newRounds = [...prev.rounds];
      newRounds[prev.currentRoundIndex] = round;
      
      return {
        ...prev,
        rounds: newRounds,
        lastSpinResult: null,
        mustGuessWord: false,
      };
    });
    
    return {
      success: isCorrect,
      comment: isCorrect 
        ? '🎉 ВЕРНО! Слово угадано!' 
        : WRONG_WORD_COMMENTS[Math.floor(Math.random() * WRONG_WORD_COMMENTS.length)],
    };
  }, [getCurrentRound]);

  // Принудительное выбывание (если не назвал слово при правиле 3 ходов)
  const eliminateCurrentPlayer = useCallback(() => {
    setState(prev => {
      const round = { ...prev.rounds[prev.currentRoundIndex] };
      const players = [...round.players];
      const playerIndex = round.currentPlayerIndex;
      
      players[playerIndex] = {
        ...players[playerIndex],
        isEliminated: true,
      };
      round.players = players;
      
      const activePlayers = players.filter(p => !p.isEliminated);
      if (activePlayers.length === 0) {
        round.isComplete = true;
      } else {
        round.currentPlayerIndex = getNextActivePlayerIndex(round);
      }
      
      const newRounds = [...prev.rounds];
      newRounds[prev.currentRoundIndex] = round;
      
      return {
        ...prev,
        rounds: newRounds,
        mustGuessWord: false,
      };
    });
  }, []);

  // Перейти к следующему раунду
  const nextRound = useCallback(() => {
    setState(prev => {
      let nextPhase = prev.phase;
      let nextRoundIndex = prev.currentRoundIndex;

      if (prev.phase === 'qualifying1') {
        nextPhase = 'qualifying2';
        nextRoundIndex = 1;
      } else if (prev.phase === 'qualifying2') {
        nextPhase = 'qualifying3';
        nextRoundIndex = 2;
      } else if (prev.phase === 'qualifying3') {
        nextPhase = 'gameover';
      }

      return {
        ...prev,
        phase: nextPhase,
        currentRoundIndex: nextRoundIndex,
        lastSpinResult: null,
        mustGuessWord: false,
      };
    });
  }, []);

  // Проверить завершено ли слово
  const checkWordComplete = (word: string, guessedLetters: string[]): boolean => {
    const normalizedWord = normalizeWord(word);
    return normalizedWord.split('').every(
      char => char === ' ' || char === '-' || guessedLetters.includes(normalizeLetter(char))
    );
  };

  // Получить случайный приз
  const getRandomPrize = useCallback(() => {
    return PRIZES[Math.floor(Math.random() * PRIZES.length)];
  }, []);

  // Сброс игры
  const resetGame = useCallback(() => {
    setState(createInitialState());
  }, []);

  // Установить порядок игроков после рандомизации
  const setPlayersOrder = useCallback((shuffledPlayers: Player[]) => {
    setState(prev => {
      const newRounds = [...prev.rounds];
      if (newRounds[prev.currentRoundIndex]) {
        newRounds[prev.currentRoundIndex] = {
          ...newRounds[prev.currentRoundIndex],
          players: shuffledPlayers,
          currentPlayerIndex: 0,
        };
      }
      return { ...prev, rounds: newRounds };
    });
  }, []);

  return {
    state,
    getCurrentRound,
    getCurrentPlayer,
    getActivePlayers,
    setupGame,
    spinWheel,
    guessLetter,
    guessWord,
    nextPlayer,
    handlePrizeChoice,
    usePlusToOpenLetter,
    eliminateCurrentPlayer,
    nextRound,
    getRandomPrize,
    resetGame,
    setPlayersOrder,
  };
}
