import { useState, useEffect, useRef } from 'react';
import { useGameState, Player } from '@/hooks/useGameState';
import { Snowfall } from '@/components/Snowfall';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { GameBoard } from '@/components/GameBoard';
import { PlayerRandomizer } from '@/components/PlayerRandomizer';
import { FinalStats } from '@/components/FinalStats';

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
  { word: 'МОЛОКО', players: PLAYERS },
  { word: 'МОЛОКО', players: PLAYERS },
  { word: 'МОЛОКО', players: PLAYERS },
];

const Index = () => {
  const {
    state,
    getCurrentRound,
    setupGame,
    spinWheel,
    guessLetter,
    guessWord,
    nextPlayer,
    usePlusToOpenLetter,
    eliminateCurrentPlayer,
    nextRound,
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
          onSpin={spinWheel}
          onGuessLetter={guessLetter}
          onGuessWord={guessWord}
          onNextPlayer={nextPlayer}
          onUsePlus={usePlusToOpenLetter}
          onEliminatePlayer={eliminateCurrentPlayer}
          onNextRound={nextRound}
        />
      )}

      {state.phase === 'gameover' && (
        <FinalStats
          playerStats={state.playerStats}
          roundsHistory={state.roundsHistory}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default Index;
