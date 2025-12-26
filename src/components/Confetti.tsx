import { useEffect, useState, useRef } from 'react';

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
}

const COLORS = [
  'hsl(0, 80%, 55%)',
  'hsl(150, 70%, 35%)',
  'hsl(45, 100%, 50%)',
  'hsl(330, 100%, 65%)',
  'hsl(180, 100%, 50%)',
  'hsl(50, 100%, 60%)',
];

function createConfettiBatch(startId: number, count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    left: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 10 + 5,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
  }));
}

export function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    // Начальная порция конфетти
    const initial = createConfettiBatch(0, 100);
    idCounter.current = 100;
    setPieces(initial);

    // Добавляем новые порции каждые 2.5 секунды
    const interval = setInterval(() => {
      const newBatch = createConfettiBatch(idCounter.current, 50);
      idCounter.current += 50;

      setPieces(prev => {
        // Убираем старые (оставляем последние 150)
        const trimmed = prev.slice(-100);
        return [...trimmed, ...newBatch];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
}
