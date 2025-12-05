import { useState } from 'react';
import { GameState, SpinResult } from '@/hooks/useGameState';
import { WheelSpinner } from './WheelSpinner';
import { WordDisplay } from './WordDisplay';
import { TeamScoreboard } from './TeamScoreboard';
import { LetterInput } from './LetterInput';
import { Character } from './Character';
import { PrizePopup } from './PrizePopup';
import { VictoryScreen } from './VictoryScreen';

interface GameBoardProps {
  state: GameState;
  onSpin: () => Promise<SpinResult>;
  onGuess: (letter: string) => { success: boolean; comment: string; alreadyGuessed: boolean };
  onNextTeam: () => void;
  getRandomPrize: () => string;
  onBackToSetup: () => void;
  onReset: () => void;
}

export function GameBoard({
  state,
  onSpin,
  onGuess,
  onNextTeam,
  getRandomPrize,
  onBackToSetup,
  onReset,
}: GameBoardProps) {
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [showPrize, setShowPrize] = useState<string | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  const currentWord = state.words[state.currentWordIndex!];

  const handleSpin = () => {
    setMessage(null);
    onSpin().then((result) => {
      setHasSpun(true);
      
      if (result.type === 'prize') {
        setTimeout(() => {
          setShowPrize(getRandomPrize());
        }, 500);
      }
      
      if (result.type === 'skip' || result.type === 'bankrupt') {
        setHasSpun(false);
      }
    });
  };

  const handleGuess = (letter: string) => {
    const result = onGuess(letter);
    
    setMessage({
      text: result.comment,
      type: result.alreadyGuessed ? 'warning' : result.success ? 'success' : 'error',
    });

    if (!result.success && !result.alreadyGuessed) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    
    setHasSpun(false);
  };

  const canGuess = hasSpun && state.lastSpinResult?.type === 'points' && !state.isSpinning;

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10">
      {/* Victory overlay */}
      {state.gamePhase === 'victory' && (
        <VictoryScreen
          word={currentWord}
          winningTeam={state.currentTeam}
          score={state.teamScores[state.currentTeam]}
          onNextWord={onBackToSetup}
          onPlayAgain={onReset}
        />
      )}

      {/* Prize popup */}
      {showPrize && (
        <PrizePopup prize={showPrize} onClose={() => setShowPrize(null)} />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-pacifico text-3xl md:text-4xl text-accent text-glow mb-2">
            Новогоднее Поле Чудес
          </h1>
          <button onClick={onBackToSetup} className="text-muted-foreground hover:text-accent text-sm">
            ← К выбору слова
          </button>
        </div>

        {/* Scoreboard */}
        <TeamScoreboard
          scores={state.teamScores}
          currentTeam={state.currentTeam}
          onNextTeam={onNextTeam}
        />

        {/* Word display */}
        <div className="bg-card/40 backdrop-blur-sm p-6 md:p-10 rounded-3xl border border-accent/30 mb-8">
          <WordDisplay
            word={currentWord}
            guessedLetters={state.guessedLetters}
            shake={shake}
          />
        </div>

        {/* Message / Character */}
        {message && (
          <div className="max-w-xl mx-auto mb-6">
            <Character
              type={message.type === 'success' ? 'host' : 'snegurochka'}
              message={message.text}
              mood={message.type === 'success' ? 'happy' : message.type === 'warning' ? 'excited' : 'sad'}
            />
          </div>
        )}

        {/* Game controls */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Wheel section */}
          <div className="bg-card/40 backdrop-blur-sm p-6 rounded-3xl border border-accent/30">
            <h3 className="font-pacifico text-2xl text-accent text-center mb-6">
              Барабан судьбы 🎰
            </h3>
            <WheelSpinner
              isSpinning={state.isSpinning}
              onSpin={handleSpin}
              disabled={hasSpun && state.lastSpinResult?.type === 'points'}
              lastResult={state.lastSpinResult}
            />
          </div>

          {/* Letter input section */}
          <div className="bg-card/40 backdrop-blur-sm p-6 rounded-3xl border border-accent/30">
            <h3 className="font-pacifico text-2xl text-accent text-center mb-6">
              Назови букву! 📢
            </h3>
            
            <LetterInput onGuess={handleGuess} disabled={!canGuess} />
            
            {!canGuess && !state.isSpinning && (
              <p className="text-center text-muted-foreground mt-4">
                {hasSpun && state.lastSpinResult?.type !== 'points'
                  ? 'Упс, крути ещё раз на следующем ходу!'
                  : 'Сначала крутани барабан! ☝️'}
              </p>
            )}

            {/* Guessed letters */}
            {state.guessedLetters.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Уже называли:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {state.guessedLetters.map((letter, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        currentWord.includes(letter)
                          ? 'bg-secondary/30 text-secondary'
                          : 'bg-primary/30 text-primary'
                      }`}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
