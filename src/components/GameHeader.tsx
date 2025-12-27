interface GameHeaderProps {
  phase: string;
}

export function GameHeader({ phase }: GameHeaderProps) {
  const getPhaseTitle = () => {
    switch (phase) {
      case 'qualifying1': return 'Раунд 1';
      case 'qualifying2': return 'Раунд 2';
      case 'qualifying3': return 'Раунд 3';
      case 'final': return 'ФИНАЛ';
      default: return 'Игра';
    }
  };

  return (
    <div className="text-center mb-6">
      <h1 className="font-pacifico text-3xl md:text-4xl text-accent text-glow">
        {getPhaseTitle()}
      </h1>
    </div>
  );
}
