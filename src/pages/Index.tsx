import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Snowfall } from '@/components/Snowfall';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { GameSetup } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';

type Screen = 'welcome' | 'setup' | 'game';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('welcome');
  const {
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
  } = useGameState();

  const handleStartGame = () => {
    setScreen('setup');
  };

  const handleStartRound = (wordIndex: number) => {
    startRound(wordIndex);
    setScreen('game');
  };

  const handleBackToSetup = () => {
    backToSetup();
    setScreen('setup');
  };

  const handleReset = () => {
    resetGame();
    setScreen('welcome');
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Snowfall />
      
      {screen === 'welcome' && (
        <WelcomeScreen onStart={handleStartGame} />
      )}
      
      {screen === 'setup' && (
        <GameSetup
          state={state}
          onSetWord={setWord}
          onSaveWord={saveWord}
          onStartRound={handleStartRound}
        />
      )}
      
      {screen === 'game' && (
        <GameBoard
          state={state}
          onSpin={spinWheel}
          onGuess={guessLetter}
          onNextTeam={nextTeam}
          getRandomPrize={getRandomPrize}
          onBackToSetup={handleBackToSetup}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default Index;
