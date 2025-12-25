import { useState, useRef } from 'react';
import { GameState, SpinResult, Round, Player } from '@/hooks/useGameState';
import { WheelSpinner } from './WheelSpinner';
import { WordDisplay } from './WordDisplay';
import { PlayerList } from './PlayerList';
import { LetterInput } from './LetterInput';
import { Character } from './Character';
import { PrizePopup } from './PrizePopup';
import { VictoryScreen } from './VictoryScreen';

const BASE = import.meta.env.BASE_URL;

interface GameBoardProps {
  state: GameState;
  currentRound: Round | undefined;
  currentPlayer: Player | null;
  onSpin: () => Promise<SpinResult>;
  onGuessLetter: (letter: string) => { success: boolean; comment: string; alreadyGuessed: boolean; count: number };
  onGuessWord: (word: string) => { success: boolean; comment: string };
  onNextPlayer: () => void;
  onPrizeChoice: (takePrize: boolean) => void;
  onUsePlus: (letter: string) => { success: boolean; comment: string };
  onEliminatePlayer: () => void;
  onNextRound: () => void;
  getRandomPrize: () => string;
  onReset: () => void;
}

export function GameBoard({
  state,
  currentRound,
  currentPlayer,
  onSpin,
  onGuessLetter,
  onGuessWord,
  onNextPlayer,
  onPrizeChoice,
  onUsePlus,
  onEliminatePlayer,
  onNextRound,
  getRandomPrize,
  onReset,
}: GameBoardProps) {
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [showPrize, setShowPrize] = useState<string | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [showWordInput, setShowWordInput] = useState(false);
  const [wordGuess, setWordGuess] = useState('');
  const [showPlusInput, setShowPlusInput] = useState(false);
  const [plusLetter, setPlusLetter] = useState('');
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);

  if (!currentRound) return null;

  const getPhaseTitle = () => {
    switch (state.phase) {
      case 'qualifying1': return 'Отборочный тур 1';
      case 'qualifying2': return 'Отборочный тур 2';
      case 'qualifying3': return 'Отборочный тур 3';
      case 'final': return '🏆 ФИНАЛ 🏆';
      default: return 'Игра';
    }
  };

  const handleSpin = () => {
    setMessage(null);
    setShowWordInput(false);
    setShowPlusInput(false);
    
    onSpin().then((result) => {
      setHasSpun(true);
      
      if (result.type === 'prize') {
        setTimeout(() => {
          setShowPrize(getRandomPrize());
        }, 500);
      } else if (result.type === 'plus') {
        setShowPlusInput(true);
      } else if (result.type === 'bankrupt' || result.type === 'zero') {
        setHasSpun(false);
      }
    });
  };

  const playCorrectSound = () => {
    if (correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch(() => {});
    }
  };

  const handleGuessLetter = (letter: string) => {
    const result = onGuessLetter(letter);

    setMessage({
      text: result.count > 0
        ? `${result.comment} (${result.count} букв${result.count > 1 ? 'ы' : 'а'}!)`
        : result.comment,
      type: result.alreadyGuessed ? 'warning' : result.success ? 'success' : 'error',
    });

    if (result.success) {
      playCorrectSound();
    }

    if (!result.success && !result.alreadyGuessed) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    setHasSpun(false);
  };

  const handleGuessWord = () => {
    if (!wordGuess.trim()) return;
    
    const result = onGuessWord(wordGuess);
    setMessage({
      text: result.comment,
      type: result.success ? 'success' : 'error',
    });
    
    if (!result.success) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    
    setWordGuess('');
    setShowWordInput(false);
    setHasSpun(false);
  };

  const handleUsePlus = () => {
    if (!plusLetter.trim()) return;
    
    const result = onUsePlus(plusLetter);
    setMessage({
      text: result.comment,
      type: 'success',
    });
    
    setPlusLetter('');
    setShowPlusInput(false);
    setHasSpun(false);
  };

  const handlePrizeChoice = (take: boolean) => {
    onPrizeChoice(take);
    setShowPrize(null);
    setHasSpun(false);
  };

  const canGuess = hasSpun && 
    (state.lastSpinResult?.type === 'points' || state.lastSpinResult?.type === 'double') && 
    !state.isSpinning;

  const activePlayers = currentRound.players.filter(p => !p.isEliminated);
  const isRoundComplete = currentRound.isComplete;

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10">
      {/* Sound effects */}
      <audio ref={correctSoundRef} src={`${BASE}sounds/correct.mp3`} />

      {/* Victory overlay */}
      {isRoundComplete && currentRound.winnerId !== null && (
        <VictoryScreen
          word={currentRound.word}
          winner={currentRound.players.find(p => p.id === currentRound.winnerId)!}
          onNextRound={onNextRound}
          onPlayAgain={onReset}
          isFinal={state.phase === 'final'}
        />
      )}

      {/* No winner scenario */}
      {isRoundComplete && currentRound.winnerId === null && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="text-center animate-bounce-in">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="font-pacifico text-3xl text-destructive mb-4">
              Никто не угадал!
            </h2>
            <p className="text-xl text-foreground mb-6">
              Слово было: <span className="font-bold text-accent">{currentRound.word}</span>
            </p>
            <button onClick={onNextRound} className="btn-secondary">
              Следующий тур →
            </button>
          </div>
        </div>
      )}

      {/* Prize popup */}
      {showPrize && state.pendingPrizeChoice && (
        <PrizePopup 
          prize={showPrize} 
          onClose={() => handlePrizeChoice(false)}
          onTakePrize={() => handlePrizeChoice(true)}
          showChoice={true}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-pacifico text-3xl md:text-4xl text-accent text-glow mb-2">
            {getPhaseTitle()}
          </h1>
          <p className="text-lg text-muted-foreground">
            💡 {currentRound.hint}
          </p>
        </div>

        {/* Players */}
        <PlayerList
          players={currentRound.players}
          currentPlayerIndex={currentRound.currentPlayerIndex}
          onNextPlayer={onNextPlayer}
        />

        {/* Must guess word warning */}
        {state.mustGuessWord && (
          <div className="bg-destructive/20 border border-destructive rounded-xl p-4 mb-6 text-center animate-pulse">
            <p className="text-destructive font-bold text-lg">
              ⚠️ Правило 3 ходов! Ты должен назвать слово или выбываешь!
            </p>
            <div className="flex gap-4 justify-center mt-3">
              <button onClick={() => setShowWordInput(true)} className="btn-primary">
                Назвать слово
              </button>
              <button onClick={onEliminatePlayer} className="btn-outline text-destructive border-destructive">
                Выбыть
              </button>
            </div>
          </div>
        )}

        {/* Word display */}
        <div className="bg-card/40 backdrop-blur-sm p-6 md:p-10 rounded-3xl border border-accent/30 mb-8">
          <WordDisplay
            word={currentRound.word}
            guessedLetters={currentRound.guessedLetters}
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
              disabled={hasSpun || activePlayers.length === 0 || isRoundComplete}
              lastResult={state.lastSpinResult}
            />
          </div>

          {/* Input section */}
          <div className="bg-card/40 backdrop-blur-sm p-6 rounded-3xl border border-accent/30">
            {/* Plus letter input */}
            {showPlusInput && (
              <div className="mb-6">
                <h3 className="font-pacifico text-xl text-accent text-center mb-4">
                  Выбери любую букву! ➕
                </h3>
                <div className="flex gap-3 justify-center">
                  <input
                    type="text"
                    value={plusLetter}
                    onChange={(e) => setPlusLetter(e.target.value.slice(-1))}
                    maxLength={1}
                    className="w-20 px-4 py-3 rounded-xl bg-background/50 border-2 border-accent text-foreground text-center text-2xl font-bold uppercase"
                  />
                  <button onClick={handleUsePlus} className="btn-accent">
                    Открыть!
                  </button>
                </div>
              </div>
            )}

            {/* Word guess input */}
            {showWordInput && (
              <div className="mb-6">
                <h3 className="font-pacifico text-xl text-accent text-center mb-4">
                  Назови слово целиком! 🎯
                </h3>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={wordGuess}
                    onChange={(e) => setWordGuess(e.target.value)}
                    placeholder="Введи слово..."
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border-2 border-accent text-foreground text-center text-xl font-bold uppercase"
                  />
                  <div className="flex gap-3 justify-center">
                    <button onClick={handleGuessWord} className="btn-primary">
                      Угадать!
                    </button>
                    <button onClick={() => setShowWordInput(false)} className="btn-outline">
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Letter input */}
            {!showPlusInput && !showWordInput && (
              <>
                <h3 className="font-pacifico text-2xl text-accent text-center mb-6">
                  Назови букву! 📢
                </h3>
                
                <LetterInput onGuess={handleGuessLetter} disabled={!canGuess} />
                
                {!canGuess && !state.isSpinning && !isRoundComplete && (
                  <p className="text-center text-muted-foreground mt-4">
                    {hasSpun ? 'Ход переходит...' : 'Сначала крутани барабан! ☝️'}
                  </p>
                )}

                {/* Guess word button */}
                {!state.mustGuessWord && !isRoundComplete && (
                  <div className="text-center mt-4">
                    <button 
                      onClick={() => setShowWordInput(true)}
                      className="btn-outline text-sm"
                    >
                      🎯 Назвать слово целиком
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Guessed letters */}
            {currentRound.guessedLetters.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Уже называли:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {currentRound.guessedLetters.map((letter, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        currentRound.word.includes(letter)
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
