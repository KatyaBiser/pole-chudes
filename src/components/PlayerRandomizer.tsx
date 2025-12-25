import { useState, useEffect, useRef } from 'react';
import { Player } from '@/hooks/useGameState';

const BASE = import.meta.env.BASE_URL;

interface PlayerRandomizerProps {
  players: Player[];
  onComplete: (shuffledPlayers: Player[]) => void;
}

export function PlayerRandomizer({ players, onComplete }: PlayerRandomizerProps) {
  const [isSpinning, setIsSpinning] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<Player[]>(players);
  const [finalOrder, setFinalOrder] = useState<Player[]>([]);
  const [showResult, setShowResult] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Запускаем музыку
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
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
    };
  }, [players]);

  const handleContinue = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onComplete(finalOrder);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <audio ref={audioRef} src={`${BASE}sounds/randomizer.mp3`} loop />
      <div className="bg-card border-2 border-accent rounded-3xl p-8 max-w-2xl w-full mx-4 animate-bounce-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🎲</div>
          <h2 className="font-pacifico text-3xl text-accent text-glow mb-2">
            {isSpinning ? 'Определяем очередь...' : 'Очередь определена!'}
          </h2>
          <p className="text-muted-foreground">
            {isSpinning ? 'Кто же будет первым?' : 'Вот в каком порядке будете играть:'}
          </p>
        </div>

        {/* Карточки игроков */}
        <div className={`grid grid-cols-5 gap-3 mb-6 ${isSpinning ? 'animate-pulse' : ''}`}>
          {displayOrder.map((player, index) => (
            <div
              key={player.id}
              className={`text-center transition-all duration-150 ${
                isSpinning ? 'scale-95' : 'scale-100'
              }`}
            >
              <div className={`rounded-xl overflow-hidden border-2 mb-2 ${
                showResult && index === 0
                  ? 'border-accent ring-2 ring-accent'
                  : 'border-border'
              }`}>
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-full aspect-square object-cover"
                />
              </div>
              <p className="font-bold text-sm text-foreground">{player.name}</p>
              {showResult && (
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
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
              className="btn-accent text-xl px-8 py-3"
            >
              Начать раунд! 🎯
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
