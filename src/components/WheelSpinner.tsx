import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SpinResult } from '@/hooks/useGameState';

const BASE = import.meta.env.BASE_URL;

interface WheelSpinnerProps {
  isSpinning: boolean;
  onSpin: () => void;
  disabled: boolean;
  lastResult: SpinResult | null;
}

const SECTORS = [
  { label: '50', color: '#e74c3c' },
  { label: '100', color: '#27ae60' },
  { label: '150', color: '#f39c12' },
  { label: '200', color: '#9b59b6' },
  { label: 'Б', color: '#2c3e50' },
  { label: '250', color: '#e91e63' },
  { label: '300', color: '#00bcd4' },
  { label: '0', color: '#607d8b' },
  { label: '500', color: '#ff5722' },
  { label: 'П', color: '#4caf50' },
  { label: '1000', color: '#ffc107' },
  { label: '+', color: '#3f51b5' },
  { label: 'x2', color: '#e91e63' },
  { label: 'Ш', color: '#009688' },
];

// Вынесен наружу чтобы не пересоздаваться при каждом рендере
function WheelGraphic({ rotation, isSpinning, size }: { rotation: number; isSpinning: boolean; size: 'normal' | 'large' }) {
  return (
    <div className={size === 'large' ? 'relative w-[500px] h-[500px] md:w-[600px] md:h-[600px]' : 'wheel-container'}>
      {/* Pointer */}
      <div className={size === 'large' ? 'absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-accent z-20 drop-shadow-lg' : 'wheel-pointer'} />

      {/* Wheel */}
      <div
        className="w-full h-full rounded-full relative overflow-hidden"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 12s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          boxShadow: '0 0 30px hsl(var(--accent) / 0.5), inset 0 0 50px rgba(0,0,0,0.3)',
        }}
      >
        {/* Sectors */}
        {SECTORS.map((sector, i) => {
          const angle = (360 / SECTORS.length);
          const rot = i * angle;
          return (
            <div
              key={i}
              className="absolute w-1/2 h-1/2 origin-bottom-right"
              style={{
                transform: `rotate(${rot}deg) skewY(${90 - angle}deg)`,
                backgroundColor: sector.color,
                top: 0,
                left: 0,
              }}
            />
          );
        })}

        {/* Sector labels */}
        {SECTORS.map((sector, i) => {
          const angle = (360 / SECTORS.length) * i + (360 / SECTORS.length / 2);
          const radius = 38;
          const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180);
          const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180);
          return (
            <div
              key={`label-${i}`}
              className={`absolute font-bold text-white drop-shadow-lg ${size === 'large' ? 'text-lg md:text-xl' : 'text-xs md:text-sm'}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              }}
            >
              {sector.label}
            </div>
          );
        })}

        {/* Center decoration */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card border-4 border-accent flex items-center justify-center shadow-lg z-10 ${
          size === 'large' ? 'w-24 h-24 md:w-32 md:h-32 text-4xl md:text-5xl' : 'w-16 h-16 md:w-20 md:h-20 text-2xl md:text-3xl'
        }`}>
          🎄
        </div>
      </div>
    </div>
  );
}

export function WheelSpinner({ isSpinning, onSpin, disabled, lastResult }: WheelSpinnerProps) {
  const [rotation, setRotation] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;

    if (isSpinning) {
      // Даём браузеру время отрендерить Portal и элемент с transition
      const timeoutId = setTimeout(() => {
        const spins = (5 + Math.random() * 5) * 360;
        const sectorAngle = Math.random() * 360;
        setRotation(prev => prev + spins + sectorAngle);
      }, 50);

      // Играем звук барабана
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }

      return () => clearTimeout(timeoutId);
    } else {
      // Останавливаем звук когда барабан остановился
      if (audio) {
        audio.pause();
      }
    }
  }, [isSpinning]);

  const getResultText = () => {
    if (!lastResult || isSpinning) return null;
    
    switch (lastResult.type) {
      case 'points':
        return `Выпало: ${lastResult.value} очков за букву!`;
      case 'bankrupt':
        return '💀 БАНКРОТ! Все очки сгорели...';
      case 'zero':
        return '😅 Ноль! Очки остаются, но ход переходит...';
      case 'prize':
        return '🎁 ПРИЗ! Возьми или продолжай играть?';
      case 'plus':
        return '➕ Открой любую букву по выбору!';
      case 'double':
        return '✖️2 Удвоитель! Очки за букву удвоятся!';
      case 'chance':
        return '🍀 ШАНС! Можешь назвать 2 буквы!';
      default:
        return lastResult.label;
    }
  };

  return (
    <>
      <audio ref={audioRef} src={`${BASE}sounds/wheel-spin.mp3`} />

      {/* Fullscreen overlay when spinning - используем Portal чтобы обойти stacking context */}
      {isSpinning && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Large wheel */}
          <div className="relative z-10">
            <WheelGraphic rotation={rotation} isSpinning={isSpinning} size="large" />
            <p className="text-center mt-8 text-2xl md:text-3xl font-bold text-accent animate-pulse">
              🎰 Крутится...
            </p>
          </div>
        </div>,
        document.body
      )}

      {/* Normal wheel view */}
      <div className="flex flex-col items-center gap-6">
        <WheelGraphic rotation={rotation} isSpinning={isSpinning} size="normal" />

        {/* Spin button */}
        <button
          onClick={onSpin}
          disabled={disabled || isSpinning}
          className="btn-accent text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? '🎰 Крутится...' : '🎯 Крутить барабан!'}
        </button>

        {/* Result display */}
        {lastResult && !isSpinning && (
          <div className="animate-bounce-in text-center max-w-sm">
            <p className={`text-xl font-bold ${
              lastResult.type === 'bankrupt' ? 'text-destructive' :
              lastResult.type === 'prize' || lastResult.type === 'plus' || lastResult.type === 'double' || lastResult.type === 'chance'
                ? 'text-accent' : 'text-secondary'
            }`}>
              {getResultText()}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
