interface TeamScoreboardProps {
  scores: [number, number, number];
  currentTeam: number;
  onNextTeam: () => void;
}

const TEAM_INFO = [
  { name: 'Мандаринки', emoji: '🍊', color: 'border-primary bg-primary/20 text-primary' },
  { name: 'Ёлочки', emoji: '🌲', color: 'border-secondary bg-secondary/20 text-secondary' },
  { name: 'Снежинки', emoji: '❄️', color: 'border-accent bg-accent/20 text-accent' },
];

export function TeamScoreboard({ scores, currentTeam, onNextTeam }: TeamScoreboardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {TEAM_INFO.map((team, index) => (
          <div
            key={index}
            className={`team-card ${index === currentTeam ? 'active' : ''} ${
              index === currentTeam ? 'ring-2 ring-accent' : ''
            }`}
          >
            <div className="text-center">
              <span className="text-2xl md:text-3xl block mb-1">{team.emoji}</span>
              <p className="font-bold text-sm md:text-base text-foreground mb-1">{team.name}</p>
              <p className={`text-2xl md:text-3xl font-bold ${
                index === currentTeam ? 'text-accent' : 'text-muted-foreground'
              }`}>
                {scores[index]}
              </p>
              {index === currentTeam && (
                <span className="inline-block mt-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full animate-pulse">
                  Ходит!
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-4">
        <button onClick={onNextTeam} className="btn-outline text-sm">
          ➡️ Передать ход
        </button>
      </div>
    </div>
  );
}
