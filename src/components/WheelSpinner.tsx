import { useState, useEffect } from 'react';
import { SpinResult } from '@/hooks/useGameState';

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

export function WheelSpinner({ isSpinning, onSpin, disabled, lastResult }: WheelSpinnerProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning) {
      const spins = (5 + Math.random() * 5) * 360;
      const sectorAngle = Math.random() * 360;
      setRotation(prev => prev + spins + sectorAngle);
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
    <div className="flex flex-col items-center gap-6">
      {/* Wheel container */}
      <div className="wheel-container">
        {/* Pointer */}
        <div className="wheel-pointer" />
        
        {/* Wheel */}
        <div
          className="w-full h-full rounded-full relative overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            boxShadow: '0 0 30px hsl(var(--accent) / 0.5), inset 0 0 50px rgba(0,0,0,0.3)',
          }}
        >
          {/* Sectors */}
          {SECTORS.map((sector, i) => {
            const angle = (360 / SECTORS.length);
            const rotation = i * angle;
            return (
              <div
                key={i}
                className="absolute w-1/2 h-1/2 origin-bottom-right"
                style={{
                  transform: `rotate(${rotation}deg) skewY(${90 - angle}deg)`,
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
            const radius = 38; // % from center
            const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180);
            const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180);
            return (
              <div
                key={`label-${i}`}
                className="absolute font-bold text-xs md:text-sm text-white drop-shadow-lg"
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-card border-4 border-accent flex items-center justify-center text-2xl md:text-3xl shadow-lg z-10">
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
  );
}
