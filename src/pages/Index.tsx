import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Snowfall } from '@/components/Snowfall';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { GameSetup } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';
import { FinalSetup } from '@/components/FinalSetup';

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
    handlePrizeChoice,
    usePlusToOpenLetter,
    eliminateCurrentPlayer,
    nextRound,
    setFinalWord,
    getRandomPrize,
    resetGame,
  } = useGameState();

  const [showWelcome, setShowWelcome] = useState(true);

  const handleStartSetup = () => {
    setShowWelcome(false);
  };

  const handleStartGame = (rounds: { word: string; hint: string; players: string[] }[]) => {
    setupGame(rounds);
  };

  const currentRound = getCurrentRound();
  const currentPlayer = getCurrentPlayer();

  // Показываем настройку финала
  const needsFinalSetup = state.phase === 'final' && currentRound && !currentRound.word;

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Snowfall />
      
      {showWelcome && (
        <WelcomeScreen onStart={handleStartSetup} />
      )}
      
      {!showWelcome && state.phase === 'setup' && (
        <GameSetup onStartGame={handleStartGame} />
      )}

      {!showWelcome && needsFinalSetup && (
        <FinalSetup 
          finalists={state.finalists}
          onSetWord={setFinalWord}
        />
      )}
      
      {!showWelcome && state.phase !== 'setup' && state.phase !== 'gameover' && !needsFinalSetup && (
        <GameBoard
          state={state}
          currentRound={currentRound}
          currentPlayer={currentPlayer}
          onSpin={spinWheel}
          onGuessLetter={guessLetter}
          onGuessWord={guessWord}
          onNextPlayer={nextPlayer}
          onPrizeChoice={handlePrizeChoice}
          onUsePlus={usePlusToOpenLetter}
          onEliminatePlayer={eliminateCurrentPlayer}
          onNextRound={nextRound}
          getRandomPrize={getRandomPrize}
          onReset={resetGame}
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
            <button onClick={resetGame} className="btn-accent text-xl">
              🔄 Сыграть ещё раз
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
