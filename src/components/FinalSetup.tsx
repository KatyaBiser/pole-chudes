import { useState } from 'react';
import { Player } from '@/hooks/useGameState';

interface FinalSetupProps {
  finalists: Player[];
  onSetWord: (word: string, hint: string) => void;
}

export function FinalSetup({ finalists, onSetWord }: FinalSetupProps) {
  const [word, setWord] = useState('');
  const [hint, setHint] = useState('');

  const handleSubmit = () => {
    if (word.trim() && hint.trim()) {
      onSetWord(word, hint);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">🏆</div>
          <h2 className="font-pacifico text-4xl md:text-5xl text-accent text-glow mb-4">
            ФИНАЛ!
          </h2>
          <p className="text-xl text-muted-foreground">
            Настройка финального раунда
          </p>
        </div>

        {/* Finalists */}
        <div className="bg-card/40 backdrop-blur-sm p-6 rounded-2xl border border-accent/30 mb-8">
          <h3 className="font-bold text-xl text-center text-accent mb-4">
            Финалисты 🌟
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {finalists.map((player, i) => (
              <div key={player.id} className="text-center p-4 bg-background/30 rounded-xl">
                <div className="text-3xl mb-2">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </div>
                <p className="font-bold text-foreground">{player.name}</p>
                <p className="text-sm text-muted-foreground">Тур {i + 1}</p>
              </div>
            ))}
          </div>
          {finalists.length === 0 && (
            <p className="text-center text-muted-foreground">
              Нет финалистов (никто не выиграл туры)
            </p>
          )}
        </div>

        {/* Word setup */}
        <div className="bg-card/40 backdrop-blur-sm p-6 rounded-2xl border border-accent/30 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Финальное слово 🤫
              </label>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Введи слово для финала..."
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-lg uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Подсказка 💡
              </label>
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Тема или подсказка..."
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-lg"
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!word.trim() || !hint.trim() || finalists.length === 0}
            className="btn-accent text-xl px-10 disabled:opacity-50"
          >
            🎯 Начать финал!
          </button>
        </div>
      </div>
    </div>
  );
}
