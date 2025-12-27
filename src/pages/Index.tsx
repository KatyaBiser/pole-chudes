import { useState, useEffect, useRef } from 'react';
import { useGameState, Player } from '@/hooks/useGameState';
import { Snowfall } from '@/components/Snowfall';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { GameBoard } from '@/components/GameBoard';
import { PlayerRandomizer } from '@/components/PlayerRandomizer';

const BASE = import.meta.env.BASE_URL;

// Захардкоженные игроки
const PLAYERS = [
  { name: 'Аня', photo: `${BASE}team/anna.png` },
  { name: 'Маша', photo: `${BASE}team/masha.png` },
  { name: 'Галя', photo: `${BASE}team/galina.png` },
  { name: 'Валера', photo: `${BASE}team/valera.png` },
  { name: 'Даня', photo: `${BASE}team/daniil.png` },
];

// Захардкоженные раунды - меняй слова здесь!
const ROUNDS = [
  { word: 'МОЛОКО', hint: 'Молочный продукт', players: PLAYERS },
  { word: 'МОЛОКО', hint: 'Молочный продукт', players: PLAYERS },
  { word: 'МОЛОКО', hint: 'Молочный продукт', players: PLAYERS },
];

const Index = () => {
  const {
    state,
    getCurrentRound,
    getCurrentPlayer,
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
  } = useGameState();

  const [showWelcome, setShowWelcome] = useState(true);
  const [showRandomizer, setShowRandomizer] = useState(false);
  const lastRoundIndex = useRef(-1);

  const handleStartGame = () => {
    setShowWelcome(false);
    setupGame(ROUNDS);
  };

  const currentRound = getCurrentRound();
  const currentPlayer = getCurrentPlayer();

  // Показываем рандомайзер при смене раунда
  useEffect(() => {
    if (
      state.phase !== 'setup' &&
      state.phase !== 'gameover' &&
      state.currentRoundIndex !== lastRoundIndex.current &&
      currentRound
    ) {
      lastRoundIndex.current = state.currentRoundIndex;
      setShowRandomizer(true);
    }
  }, [state.phase, state.currentRoundIndex, currentRound]);

  const handleRandomizerComplete = (shuffledPlayers: Player[]) => {
    setPlayersOrder(shuffledPlayers);
    setShowRandomizer(false);
  };

  const handleReset = () => {
    lastRoundIndex.current = -1;
    setShowWelcome(true);
    resetGame();
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Snowfall />
      
      {showWelcome && (
        <WelcomeScreen onStart={handleStartGame} />
      )}

      {/* Рандомайзер очереди */}
      {showRandomizer && currentRound && (
        <PlayerRandomizer
          players={currentRound.players}
          roundNumber={state.currentRoundIndex + 1}
          onComplete={handleRandomizerComplete}
        />
      )}

      {!showWelcome && state.phase !== 'gameover' && !showRandomizer && (
        <GameBoard
          state={state}
          currentRound={currentRound}
          currentPlayer={currentPlayer}
          onSpin={spinWheel}
          onGuessLetter={guessLetter}
          onGuessWord={guessWord}
          onNextPlayer={nextPlayer}
          onUsePlus={usePlusToOpenLetter}
          onEliminatePlayer={eliminateCurrentPlayer}
          onNextRound={nextRound}
          getRandomPrize={getRandomPrize}
          onReset={handleReset}
        />
      )}

      {state.phase === 'gameover' && (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="text-center">
            <div className="text-8xl mb-6 animate-float">🎄</div>
            <h1 className="font-pacifico text-5xl text-accent text-glow mb-6">
              Игра завершена!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Спасибо за игру! С Новым Годом! 🎉
            </p>
            <button onClick={handleReset} className="btn-accent text-xl">
              🔄 Сыграть ещё раз
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
