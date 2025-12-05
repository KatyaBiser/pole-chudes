import { useState, useEffect } from 'react';
import { SpinResult } from '@/hooks/useGameState';

interface WheelSpinnerProps {
  isSpinning: boolean;
  onSpin: () => void;
  disabled: boolean;
  lastResult: SpinResult | null;
}

const SECTORS = [
  { label: '+100', color: 'primary' },
  { label: '+200', color: 'secondary' },
  { label: '+300', color: 'accent' },
  { label: '+500', color: 'neon-pink' },
  { label: 'Пропуск', color: 'neon-cyan' },
  { label: '+1000', color: 'christmas-red' },
  { label: '🎁 Приз', color: 'gold' },
  { label: 'Банкрот', color: 'christmas-green' },
];

export function WheelSpinner({ isSpinning, onSpin, disabled, lastResult }: WheelSpinnerProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning) {
      // Random rotation between 5-10 full spins plus random sector
      const spins = (5 + Math.random() * 5) * 360;
      const sectorAngle = Math.random() * 360;
      setRotation(prev => prev + spins + sectorAngle);
    }
  }, [isSpinning]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Wheel container */}
      <div className="wheel-container">
        {/* Pointer */}
        <div className="wheel-pointer" />
        
        {/* Wheel */}
        <div
          className="wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {/* Sector labels */}
          {SECTORS.map((sector, i) => {
            const angle = (i * 45) + 22.5; // Center of each 45° sector
            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-full origin-left"
                style={{
                  transform: `rotate(${angle}deg) translateX(10%)`,
                }}
              >
                <span
                  className="inline-block font-bold text-xs md:text-sm text-background"
                  style={{
                    transform: 'rotate(90deg)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sector.label}
                </span>
              </div>
            );
          })}
          
          {/* Center decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-card border-4 border-accent flex items-center justify-center text-3xl md:text-4xl shadow-lg">
            🎄
          </div>
        </div>
      </div>

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
        <div className="animate-bounce-in text-center">
          <p className="text-2xl font-bold text-accent">
            {lastResult.type === 'points' && `Выпало: ${lastResult.label} очков!`}
            {lastResult.type === 'skip' && 'Пропуск хода! Судьба сказала "отдохни, зайчик" 🐰'}
            {lastResult.type === 'bankrupt' && 'БАНКРОТ! Но ты всё равно лапочка 💔'}
            {lastResult.type === 'prize' && '🎁 ПРИЗ! Смотри что тебе выпало!'}
          </p>
        </div>
      )}
    </div>
  );
}
