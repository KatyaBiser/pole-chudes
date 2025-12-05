import { useState } from 'react';

interface RoundSetup {
  word: string;
  hint: string;
  players: [string, string, string];
}

interface GameSetupProps {
  onStartGame: (rounds: { word: string; hint: string; players: string[] }[]) => void;
}

const TEAM_COLORS = [
  { border: 'border-primary', bg: 'bg-primary/20', text: 'text-primary' },
  { border: 'border-secondary', bg: 'bg-secondary/20', text: 'text-secondary' },
  { border: 'border-accent', bg: 'bg-accent/20', text: 'text-accent' },
];

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [rounds, setRounds] = useState<RoundSetup[]>([
    { word: '', hint: '', players: ['Игрок 1', 'Игрок 2', 'Игрок 3'] },
    { word: '', hint: '', players: ['Игрок 4', 'Игрок 5', 'Игрок 6'] },
    { word: '', hint: '', players: ['Игрок 7', 'Игрок 8', 'Игрок 9'] },
  ]);
  
  const [currentStep, setCurrentStep] = useState(0);

  const updateRound = (roundIndex: number, field: keyof RoundSetup, value: string | [string, string, string]) => {
    setRounds(prev => {
      const newRounds = [...prev];
      newRounds[roundIndex] = { ...newRounds[roundIndex], [field]: value };
      return newRounds;
    });
  };

  const updatePlayer = (roundIndex: number, playerIndex: number, name: string) => {
    setRounds(prev => {
      const newRounds = [...prev];
      const newPlayers = [...newRounds[roundIndex].players] as [string, string, string];
      newPlayers[playerIndex] = name;
      newRounds[roundIndex] = { ...newRounds[roundIndex], players: newPlayers };
      return newRounds;
    });
  };

  const isRoundValid = (round: RoundSetup) => {
    return round.word.trim() !== '' && round.hint.trim() !== '';
  };

  const canProceed = isRoundValid(rounds[currentStep]);
  const allRoundsValid = rounds.every(isRoundValid);

  const handleStart = () => {
    if (allRoundsValid) {
      onStartGame(rounds);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-pacifico text-4xl md:text-5xl text-accent text-glow mb-4">
            Настройка игры
          </h2>
          <p className="text-muted-foreground text-lg">
            Настрой 3 отборочных тура для игры 🎮
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                currentStep === step
                  ? 'bg-accent text-accent-foreground scale-110'
                  : isRoundValid(rounds[step])
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step + 1}
            </button>
          ))}
        </div>

        {/* Current round setup */}
        <div className={`p-6 rounded-2xl border-2 ${TEAM_COLORS[currentStep].border} ${TEAM_COLORS[currentStep].bg} backdrop-blur-sm mb-6`}>
          <h3 className={`font-bold text-2xl mb-6 ${TEAM_COLORS[currentStep].text} text-center`}>
            Тур {currentStep + 1} 🎯
          </h3>

          {/* Word and hint */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Загаданное слово (только для ведущего!) 🤫
              </label>
              <input
                type="text"
                value={rounds[currentStep].word}
                onChange={(e) => updateRound(currentStep, 'word', e.target.value)}
                placeholder="Введи слово..."
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-lg uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Подсказка для игроков 💡
              </label>
              <input
                type="text"
                value={rounds[currentStep].hint}
                onChange={(e) => updateRound(currentStep, 'hint', e.target.value)}
                placeholder="Тема или подсказка..."
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-lg"
              />
            </div>
          </div>

          {/* Players */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Имена игроков 👥
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((playerIndex) => (
                <input
                  key={playerIndex}
                  type="text"
                  value={rounds[currentStep].players[playerIndex]}
                  onChange={(e) => updatePlayer(currentStep, playerIndex, e.target.value)}
                  placeholder={`Игрок ${playerIndex + 1}`}
                  className="px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-center"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="btn-outline disabled:opacity-50"
          >
            ← Назад
          </button>

          {currentStep < 2 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed}
              className="btn-secondary disabled:opacity-50"
            >
              Далее →
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={!allRoundsValid}
              className="btn-accent disabled:opacity-50 text-xl px-8"
            >
              🎄 Начать игру! 🎄
            </button>
          )}
        </div>

        {/* Preview */}
        {allRoundsValid && (
          <div className="mt-8 p-4 bg-card/40 rounded-xl border border-border">
            <h4 className="font-bold text-center text-accent mb-4">Готово к игре!</h4>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              {rounds.map((round, i) => (
                <div key={i} className="p-2">
                  <p className="text-muted-foreground">Тур {i + 1}</p>
                  <p className="font-bold text-foreground">{round.hint}</p>
                  <p className="text-xs text-muted-foreground">
                    {round.players.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
