interface CharacterProps {
  type: 'host' | 'snegurochka';
  message: string;
  mood: 'happy' | 'sad' | 'excited';
}

export function Character({ type, message, mood }: CharacterProps) {
  const getEmoji = () => {
    if (type === 'host') {
      switch (mood) {
        case 'happy': return '🎅';
        case 'sad': return '😅';
        case 'excited': return '🤩';
      }
    } else {
      switch (mood) {
        case 'happy': return '👸❄️';
        case 'sad': return '😢❄️';
        case 'excited': return '🎉❄️';
      }
    }
  };

  const getName = () => {
    return type === 'host' ? 'Ленивый Дед Мороз' : 'Снегурочка 2.0';
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-card/80 backdrop-blur-sm rounded-xl border border-accent/30 animate-bounce-in">
      <div className="text-4xl animate-float">{getEmoji()}</div>
      <div className="flex-1">
        <p className="text-sm font-bold text-accent mb-1">{getName()}</p>
        <p className="text-foreground">{message}</p>
      </div>
    </div>
  );
}
