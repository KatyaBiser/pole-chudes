import { useState, useRef } from 'react';
import { GameState, SpinResult, Round, Player } from '@/hooks/useGameState';
import { WheelSpinner } from './WheelSpinner';
import { WordDisplay } from './WordDisplay';
import { PlayerList } from './PlayerList';
import { LetterInput } from './LetterInput';
import { Character } from './Character';
import { PrizePopup } from './PrizePopup';
import { VictoryScreen } from './VictoryScreen';
import { GameHeader } from './GameHeader';
import { GuessedLetters } from './GuessedLetters';
import { NoWinnerOverlay } from './NoWinnerOverlay';
import { MustGuessWarning } from './MustGuessWarning';

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
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongWordSoundRef = useRef<HTMLAudioElement | null>(null);

  if (!currentRound) return null;

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

  const playWrongSound = () => {
    if (wrongSoundRef.current) {
      wrongSoundRef.current.currentTime = 0;
      wrongSoundRef.current.play().catch(() => {});
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
    } else if (!result.alreadyGuessed) {
      playWrongSound();
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
      wrongWordSoundRef.current?.play();
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
      <audio ref={wrongSoundRef} src={`${BASE}sounds/wrong.mp3`} />
      <audio ref={wrongWordSoundRef} src={`${BASE}sounds/wrong-word.mp3`} />

      {/* Victory overlay */}
      {isRoundComplete && currentRound.winnerId !== null && (
        <VictoryScreen
          word={currentRound.word}
          winner={currentRound.players.find(p => p.id === currentRound.winnerId)!}
          onNextRound={onNextRound}
        />
      )}

      {/* No winner scenario */}
      {isRoundComplete && currentRound.winnerId === null && (
        <NoWinnerOverlay word={currentRound.word} onNextRound={onNextRound} />
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
        <GameHeader phase={state.phase} hint={currentRound.hint} />

        {/* Players */}
        <PlayerList
          players={currentRound.players}
          currentPlayerIndex={currentRound.currentPlayerIndex}
          onNextPlayer={onNextPlayer}
        />

        {/* Must guess word warning */}
        {state.mustGuessWord && (
          <MustGuessWarning
            onGuessWord={() => setShowWordInput(true)}
            onEliminate={onEliminatePlayer}
          />
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
            <GuessedLetters letters={currentRound.guessedLetters} word={currentRound.word} />
          </div>
        </div>
      </div>
    </div>
  );
}
