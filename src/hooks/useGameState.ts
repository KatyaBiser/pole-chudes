import { useState, useCallback } from 'react';
import {
  WHEEL_SECTORS,
  PRIZES,
  SUCCESS_COMMENTS,
  FAIL_COMMENTS,
  WRONG_WORD_COMMENTS,
  ALREADY_GUESSED_COMMENTS,
  SPIN_DELAY_MS,
} from '@/config/gameConfig';
import { normalizeLetter, normalizeWord, checkWordComplete, getRandomItem } from '@/lib/gameUtils';

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
  pendingSpinResult: SpinResult | null; // Результат известен сразу, но показываем после анимации
  isSpinning: boolean;
  mustGuessWord: boolean;
  doubleMultiplierUsed: number;
  usedGifts: string[]; // Названия использованных подарков в текущем раунде
  playerGifts: Record<number, string[]>; // playerId -> список полученных подарков
}

export interface SpinResult {
  type: 'points' | 'bankrupt' | 'zero' | 'plus' | 'double' | 'gift';
  value: number;
  label: string;
  giftName?: string; // Для подарков: шоколадка, конфета, печенье
}

const createInitialState = (): GameState => ({
  phase: 'setup',
  rounds: [],
  currentRoundIndex: 0,
  lastSpinResult: null,
  pendingSpinResult: null,
  isSpinning: false,
  mustGuessWord: false,
  doubleMultiplierUsed: 0,
  usedGifts: [],
  playerGifts: {},
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
      };
    });
  }, []);

  // Крутить барабан
  const spinWheel = useCallback(() => {
    return new Promise<SpinResult>((resolve) => {
      setState(prev => {
        // Фильтруем секторы - исключаем использованные подарки
        const availableSectors = WHEEL_SECTORS.filter(sector => {
          if (sector.type === 'gift' && sector.giftName) {
            return !prev.usedGifts.includes(sector.giftName);
          }
          return true;
        });

        // Определяем результат СРАЗУ, чтобы барабан мог показать правильный сектор
        const result = getRandomItem(availableSectors);

        // Запускаем таймер для обработки результата после анимации
        setTimeout(() => {
          setState(innerPrev => {
            let newState = {
              ...innerPrev,
              isSpinning: false,
              lastSpinResult: result,
              pendingSpinResult: null,
            };

            const round = { ...innerPrev.rounds[innerPrev.currentRoundIndex] };
            const playerIndex = round.currentPlayerIndex;
            const players = [...round.players];
            const player = { ...players[playerIndex] };

            if (result.type === 'bankrupt') {
              // Банкрот - теряем все очки раунда, ход переходит
              player.score = 0;
              player.consecutiveCorrectGuesses = 0;
              players[playerIndex] = player;
              round.players = players;
              round.currentPlayerIndex = getNextActivePlayerIndex(round);

              const newRounds = [...innerPrev.rounds];
              newRounds[innerPrev.currentRoundIndex] = round;
              newState = { ...newState, rounds: newRounds };
            } else if (result.type === 'zero') {
              // Ноль - сохраняем очки, но ход переходит
              player.consecutiveCorrectGuesses = 0;
              players[playerIndex] = player;
              round.players = players;
              round.currentPlayerIndex = getNextActivePlayerIndex(round);

              const newRounds = [...innerPrev.rounds];
              newRounds[innerPrev.currentRoundIndex] = round;
              newState = { ...newState, rounds: newRounds };
            } else if (result.type === 'gift' && result.giftName) {
              // Подарок - добавляем игроку, сектор исчезает, ход остаётся
              const playerId = player.id;
              const currentGifts = innerPrev.playerGifts[playerId] || [];
              newState.playerGifts = {
                ...innerPrev.playerGifts,
                [playerId]: [...currentGifts, result.giftName],
              };
              newState.usedGifts = [...innerPrev.usedGifts, result.giftName];
              // Ход остаётся у игрока - не меняем currentPlayerIndex
            } else if (result.type === 'double') {
              // Удвоитель - если уже использован 2 раза, даём 300 очков
              if (innerPrev.doubleMultiplierUsed >= 2) {
                newState.lastSpinResult = { type: 'points', value: 300, label: '300 (вместо x2)' };
              } else {
                newState.doubleMultiplierUsed = innerPrev.doubleMultiplierUsed + 1;
              }
            }
            // plus и points обрабатываются в guessLetter

            return newState;
          });
          resolve(result);
        }, SPIN_DELAY_MS);

        return {
          ...prev,
          isSpinning: true,
          pendingSpinResult: result,
        };
      });
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
        comment: getRandomItem(ALREADY_GUESSED_COMMENTS),
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
      comment: isInWord ? getRandomItem(SUCCESS_COMMENTS) : getRandomItem(FAIL_COMMENTS),
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
        : getRandomItem(WRONG_WORD_COMMENTS),
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
        usedGifts: [], // Сброс подарков для нового раунда
        doubleMultiplierUsed: 0, // Сброс счётчика удвоителя
      };
    });
  }, []);

  // Получить случайный приз
  const getRandomPrize = useCallback(() => {
    return getRandomItem(PRIZES);
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
    usePlusToOpenLetter,
    eliminateCurrentPlayer,
    nextRound,
    getRandomPrize,
    resetGame,
    setPlayersOrder,
  };
}
