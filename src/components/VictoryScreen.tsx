import { useEffect, useRef } from 'react';
import { Confetti } from './Confetti';
import { Player } from '@/hooks/useGameState';

const BASE = import.meta.env.BASE_URL;

interface VictoryScreenProps {
  word: string;
  winner: Player;
  onNextRound: () => void;
}

export function VictoryScreen({ word, winner, onNextRound }: VictoryScreenProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }

    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src={`${BASE}sounds/winner.mp3`} loop />
      <Confetti />
      <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div className="text-center animate-bounce-in">
          <div className="text-8xl mb-6 animate-float">🎉</div>

          <h2 className="font-pacifico text-5xl md:text-6xl text-accent text-glow mb-4">
            СЛОВО УГАДАНО!
          </h2>

          <p className="text-2xl text-foreground mb-2">Слово:</p>

          <p className="text-4xl md:text-5xl font-bold text-primary text-glow-red mb-6">
            {word}
          </p>

          <div className="bg-card/60 backdrop-blur-sm p-6 rounded-2xl border border-accent/30 mb-8 inline-block">
            <p className="text-xl text-muted-foreground mb-2">Победитель тура:</p>
            <p className="text-3xl font-bold text-accent">{winner.name}</p>
            <p className="text-2xl text-foreground mt-2">{winner.score} очков! 🏆</p>
          </div>

          <div className="flex justify-center">
            <button onClick={onNextRound} className="btn-accent">
              🎯 Следующий тур
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
