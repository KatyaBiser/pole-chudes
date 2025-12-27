import { useState, useRef } from 'react';
import { GameState, SpinResult, Round } from '@/hooks/useGameState';
import { WheelSpinner } from './WheelSpinner';
import { WordDisplay } from './WordDisplay';
import { PlayerList } from './PlayerList';
import { LetterInput } from './LetterInput';
import { Character } from './Character';
import { VictoryScreen } from './VictoryScreen';
import { GameHeader } from './GameHeader';
import { GuessedLetters } from './GuessedLetters';
import { NoWinnerOverlay } from './NoWinnerOverlay';
import { MustGuessWarning } from './MustGuessWarning';
import { GiftPopup } from './GiftPopup';

const BASE = import.meta.env.BASE_URL;

interface GameBoardProps {
  state: GameState;
  currentRound: Round | undefined;
  onSpin: () => Promise<SpinResult>;
  onGuessLetter: (letter: string) => { success: boolean; comment: string; alreadyGuessed: boolean; count: number };
  onGuessWord: (word: string) => { success: boolean; comment: string };
  onNextPlayer: () => void;
  onUsePlus: (letter: string) => { success: boolean; comment: string };
  onEliminatePlayer: () => void;
  onNextRound: () => void;
}

export function GameBoard({
  state,
  currentRound,
  onSpin,
  onGuessLetter,
  onGuessWord,
  onNextPlayer,
  onUsePlus,
  onEliminatePlayer,
  onNextRound,
}: GameBoardProps) {
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [showGift, setShowGift] = useState<{ name: string; emoji: string } | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [showWordInput, setShowWordInput] = useState(false);
  const [wordGuess, setWordGuess] = useState('');
  const [showPlusInput, setShowPlusInput] = useState(false);
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

      if (result.type === 'gift' && result.giftName) {
        // Показываем popup с подарком
        setTimeout(() => {
          setShowGift({
            name: result.giftName!,
            emoji: '🎁',
          });
        }, 500);
        // После подарка игрок крутит снова
        setHasSpun(false);
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

  const handleUsePlus = (letter: string) => {
    const result = onUsePlus(letter);
    setMessage({
      text: result.comment,
      type: 'success',
    });

    setShowPlusInput(false);
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

      {/* Gift popup */}
      {showGift && (
        <GiftPopup
          giftName={showGift.name}
          giftEmoji={showGift.emoji}
          onClose={() => setShowGift(null)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <GameHeader phase={state.phase} />

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
          {showPlusInput && (
            <p className="text-center text-accent font-bold text-lg mb-4 animate-pulse">
              ➕ Нажми на любую скрытую букву, чтобы открыть её!
            </p>
          )}
          <WordDisplay
            word={currentRound.word}
            guessedLetters={currentRound.guessedLetters}
            shake={shake}
            clickable={showPlusInput}
            onLetterClick={showPlusInput ? handleUsePlus : undefined}
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
              shuffledSectorOrder={state.shuffledSectorOrder}
              targetSectorPosition={state.targetSectorPosition}
              usedGifts={state.usedGifts}
            />
          </div>

          {/* Input section */}
          <div className="bg-card/40 backdrop-blur-sm p-6 rounded-3xl border border-accent/30">
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
