import { useRef, useState } from 'react';

const BASE = import.meta.env.BASE_URL;

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.volume = 0.5;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleStart = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onStart();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      {/* Background music */}
      <audio ref={audioRef} src={`${BASE}sounds/theme.mp3`} loop />

      {/* Sound toggle button */}
      <button
        onClick={toggleMusic}
        className="absolute top-4 right-4 text-3xl p-2 hover:scale-110 transition-transform"
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl animate-float" style={{ animationDelay: '0s' }}>🎄</div>
      <div className="absolute top-20 right-20 text-5xl animate-float" style={{ animationDelay: '0.5s' }}>⭐</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-float" style={{ animationDelay: '1s' }}>🎁</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-float" style={{ animationDelay: '1.5s' }}>🍊</div>
      
      <div className="text-center max-w-3xl">
        {/* Main title */}
        <h1 className="font-pacifico text-5xl md:text-7xl lg:text-8xl text-accent text-glow mb-12 leading-tight">
          Новогоднее
          <br />
          <span className="text-primary text-glow-red">Поле Чудес</span>
        </h1>
        
        {/* Fun description */}
        <div className="bg-card/60 backdrop-blur-sm p-6 rounded-2xl border border-accent/30 mb-10">
          <p className="text-lg text-muted-foreground">
            Усаживайтесь поудобнее, наливайте чего покрепче и готовьтесь орать буквы как в детстве у телевизора.
            Только теперь приз — не машина, а чувство собственного превосходства над друзьями. 🏆
          </p>
        </div>
        
        {/* Start button */}
        <button
          onClick={handleStart}
          className="btn-accent text-2xl px-12 py-5 animate-pulse-glow"
        >
          🎄 Начать игру! 🎄
        </button>
        
      </div>
    </div>
  );
}
