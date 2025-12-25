import { useState, useEffect, useRef } from 'react';
import { Player } from '@/hooks/useGameState';

const BASE = import.meta.env.BASE_URL;

interface PlayerRandomizerProps {
  players: Player[];
  roundNumber: number;
  onComplete: (shuffledPlayers: Player[]) => void;
}

const ROUND_NAMES = ['Первый раунд', 'Второй раунд', 'Третий раунд', 'Финал'];

export function PlayerRandomizer({ players, roundNumber, onComplete }: PlayerRandomizerProps) {
  const [isSpinning, setIsSpinning] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<Player[]>(players);
  const [finalOrder, setFinalOrder] = useState<Player[]>([]);
  const [showResult, setShowResult] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Запускаем музыку и видео
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    // Перемешиваем массив (Fisher-Yates shuffle)
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setFinalOrder(shuffled);

    // Анимация перемешивания
    let count = 0;
    const interval = setInterval(() => {
      const tempOrder = [...players];
      for (let i = tempOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tempOrder[i], tempOrder[j]] = [tempOrder[j], tempOrder[i]];
      }
      setDisplayOrder(tempOrder);
      count++;

      if (count >= 20) {
        clearInterval(interval);
        setDisplayOrder(shuffled);
        setIsSpinning(false);
        setTimeout(() => setShowResult(true), 500);
      }
    }, 250);

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [players]);

  const handleContinue = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onComplete(finalOrder);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background video */}
      <video
        ref={videoRef}
        src={`${BASE}video/randomizer-bg.mp4`}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        loop
        playsInline
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      <audio ref={audioRef} src={`${BASE}sounds/randomizer.mp3`} loop />
      <div className="relative bg-card/90 border-2 border-accent rounded-3xl p-10 max-w-5xl w-full mx-4 animate-bounce-in backdrop-blur-sm">
        {/* Номер раунда */}
        <div className="text-center mb-4">
          <span className="inline-block bg-accent text-accent-foreground text-2xl font-bold px-6 py-2 rounded-full">
            {ROUND_NAMES[roundNumber - 1] || `Раунд ${roundNumber}`}
          </span>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl mb-5">🎲</div>
          <h2 className="font-pacifico text-4xl text-accent text-glow mb-3">
            {isSpinning ? 'Определяем очередь...' : 'Очередь определена!'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isSpinning ? 'Кто же будет первым?' : 'Вот в каком порядке будете играть:'}
          </p>
        </div>

        {/* Карточки игроков */}
        <div className={`grid grid-cols-5 gap-5 mb-8 ${isSpinning ? 'animate-pulse' : ''}`}>
          {displayOrder.map((player, index) => (
            <div
              key={player.id}
              className={`text-center transition-all duration-150 ${
                isSpinning ? 'scale-95' : 'scale-100'
              }`}
            >
              <div className={`rounded-xl overflow-hidden border-3 mb-3 ${
                showResult && index === 0
                  ? 'border-accent ring-4 ring-accent'
                  : 'border-border'
              }`}>
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-full aspect-square object-cover"
                />
              </div>
              <p className="font-bold text-base text-foreground">{player.name}</p>
              {showResult && (
                <span className={`inline-block mt-2 text-sm px-3 py-1 rounded-full ${
                  index === 0
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index === 0 ? '🥇 Первый!' : `${index + 1}-й`}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Кнопка продолжить */}
        {showResult && (
          <div className="text-center animate-bounce-in">
            <button
              onClick={handleContinue}
              className="btn-accent text-2xl px-10 py-4"
            >
              Начать раунд! 🎯
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
