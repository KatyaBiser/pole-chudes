import { useState } from 'react';
import { GameState } from '@/hooks/useGameState';

interface GameSetupProps {
  state: GameState;
  onSetWord: (index: number, word: string) => void;
  onSaveWord: (index: number) => void;
  onStartRound: (wordIndex: number) => void;
}

const TEAM_COLORS = [
  { bg: 'bg-primary/20', border: 'border-primary', text: 'text-primary' },
  { bg: 'bg-secondary/20', border: 'border-secondary', text: 'text-secondary' },
  { bg: 'bg-accent/20', border: 'border-accent', text: 'text-accent' },
];

const TEAM_NAMES = ['Команда Мандаринок 🍊', 'Команда Ёлочек 🌲', 'Команда Снежинок ❄️'];

export function GameSetup({ state, onSetWord, onSaveWord, onStartRound }: GameSetupProps) {
  const [inputs, setInputs] = useState(['', '', '']);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
    onSetWord(index, value);
  };

  const allWordsSaved = state.wordsSaved.every(Boolean);

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-pacifico text-4xl md:text-5xl text-accent text-glow mb-4">
            Настройка игры
          </h2>
          <p className="text-muted-foreground text-lg">
            Ведущий, введи слова для каждой команды! (никому не показывай 🤫)
          </p>
        </div>

        {/* Word inputs */}
        <div className="grid gap-6 mb-10">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl border-2 ${TEAM_COLORS[index].border} ${TEAM_COLORS[index].bg} backdrop-blur-sm transition-all duration-300`}
            >
              <h3 className={`font-bold text-xl mb-4 ${TEAM_COLORS[index].text}`}>
                {TEAM_NAMES[index]}
              </h3>
              
              {state.wordsSaved[index] ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-foreground font-medium">
                    Слово готово! Никому не говори 👀
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={inputs[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    placeholder="Введи слово..."
                    className="flex-1 px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-lg"
                  />
                  <button
                    onClick={() => onSaveWord(index)}
                    disabled={!inputs[index].trim()}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    Сохранить 🔒
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Start game buttons */}
        {allWordsSaved && (
          <div className="animate-bounce-in">
            <h3 className="text-center font-pacifico text-3xl text-accent text-glow mb-6">
              Выбери раунд! 🎮
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => onStartRound(index)}
                  className={`p-6 rounded-2xl border-2 ${TEAM_COLORS[index].border} ${TEAM_COLORS[index].bg} hover:scale-105 transition-all duration-300`}
                >
                  <span className="text-4xl block mb-2">
                    {index === 0 ? '🍊' : index === 1 ? '🌲' : '❄️'}
                  </span>
                  <span className={`font-bold text-lg ${TEAM_COLORS[index].text}`}>
                    Играть за {TEAM_NAMES[index].split(' ')[1]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!allWordsSaved && (
          <p className="text-center text-muted-foreground">
            Сохрани все три слова, чтобы начать игру! 👆
          </p>
        )}
      </div>
    </div>
  );
}
