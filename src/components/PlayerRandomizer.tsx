import { useState, useEffect, useRef } from 'react';
import { Player } from '@/hooks/useGameState';
import { shuffleArray } from '@/lib/gameUtils';

const BASE = import.meta.env.BASE_URL;

interface PlayerRandomizerProps {
  players: Player[];
  roundNumber: number;
  onComplete: (shuffledPlayers: Player[]) => void;
}

const ROUND_NAMES = ['Первый раунд', 'Второй раунд', 'Третий раунд', 'Финал'];

export function PlayerRandomizer({ players, roundNumber, onComplete }: PlayerRandomizerProps) {
  // Сколько мест уже раскрыто
  const [revealedCount, setRevealedCount] = useState(0);
  // Финальный порядок (определяется сразу)
  const [finalOrder, setFinalOrder] = useState<Player[]>([]);
  // Текущий отображаемый порядок (для анимации крутящихся)
  const [displayOrder, setDisplayOrder] = useState<Player[]>(players);
  // Идёт ли сейчас вращение
  const [isSpinning, setIsSpinning] = useState(true);
  // Все места раскрыты
  const [allRevealed, setAllRevealed] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;

    // Запускаем музыку и видео
    if (audio) {
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
    if (video) {
      video.play().catch(() => {});
    }

    // Определяем финальный порядок сразу
    const shuffled = shuffleArray(players);
    setFinalOrder(shuffled);
    setDisplayOrder(shuffled);

    // Анимация вращения
    let spinCount = 0;
    let currentRevealed = 0;
    const SPINS_PER_PLACE = 12;

    const interval = setInterval(() => {
      spinCount++;

      // Каждые SPINS_PER_PLACE итераций раскрываем следующее место
      const shouldReveal = spinCount % SPINS_PER_PLACE === 0 && currentRevealed < players.length;

      if (shouldReveal) {
        const remainingCount = players.length - currentRevealed;

        // Если осталось 2 игрока - раскрываем обоих сразу
        if (remainingCount === 2) {
          setDisplayOrder(shuffled);
          setRevealedCount(players.length);
          setAllRevealed(true);
          setIsSpinning(false);
          clearInterval(interval);
          return;
        }

        // Фиксируем следующее место (без предварительного перемешивания)
        setDisplayOrder(() => {
          const revealed = shuffled.slice(0, currentRevealed);
          const correctPlayer = shuffled[currentRevealed];
          const remaining = shuffled.slice(currentRevealed + 1);
          return [...revealed, correctPlayer, ...shuffleArray(remaining)];
        });

        currentRevealed++;
        setRevealedCount(currentRevealed);
      } else {
        // Крутим только нераскрытые позиции
        setDisplayOrder(prev => {
          const revealed = prev.slice(0, currentRevealed);
          const remaining = prev.slice(currentRevealed);
          if (remaining.length <= 1) return prev;
          return [...revealed, ...shuffleArray(remaining)];
        });
      }
    }, 200);

    return () => {
      clearInterval(interval);
      if (audio) {
        audio.pause();
      }
      if (video) {
        video.pause();
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
            {allRevealed ? 'Очередь определена!' : 'Определяем очередь...'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {allRevealed ? 'Вот в каком порядке будете играть:' : 'Кто же будет следующим?'}
          </p>
        </div>

        {/* Карточки игроков - оригинальный дизайн */}
        <div className="grid grid-cols-5 gap-5 mb-8">
          {displayOrder.map((player, index) => {
            const isRevealed = index < revealedCount;
            const isCurrentlySpinning = !isRevealed && isSpinning;

            return (
              <div
                key={player.id}
                className={`text-center transition-all duration-150 ${
                  isCurrentlySpinning ? 'scale-95' : 'scale-100'
                }`}
              >
                <div className={`rounded-xl overflow-hidden border-3 mb-3 ${
                  isRevealed && index === 0
                    ? 'border-accent ring-4 ring-accent'
                    : isRevealed
                    ? 'border-green-500'
                    : 'border-border'
                }`}>
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="w-full aspect-square object-cover"
                  />
                </div>
                <p className="font-bold text-base text-foreground">{player.name}</p>
                {isRevealed ? (
                  <span className={`inline-block mt-2 text-sm px-3 py-1 rounded-full ${
                    index === 0
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {index === 0 ? '🥇 Первый!' : `${index + 1}-й`}
                  </span>
                ) : (
                  <span className="inline-block mt-2 text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground animate-pulse">
                    ?
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Кнопка продолжить */}
        {allRevealed && (
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
