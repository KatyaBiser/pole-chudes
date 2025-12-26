interface GameHeaderProps {
  phase: string;
  hint: string;
}

export function GameHeader({ phase, hint }: GameHeaderProps) {
  const getPhaseTitle = () => {
    switch (phase) {
      case 'qualifying1': return 'Отборочный тур 1';
      case 'qualifying2': return 'Отборочный тур 2';
      case 'qualifying3': return 'Отборочный тур 3';
      case 'final': return 'ФИНАЛ';
      default: return 'Игра';
    }
  };

  return (
    <div className="text-center mb-6">
      <h1 className="font-pacifico text-3xl md:text-4xl text-accent text-glow mb-2">
        {getPhaseTitle()}
      </h1>
      <p className="text-lg text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}
