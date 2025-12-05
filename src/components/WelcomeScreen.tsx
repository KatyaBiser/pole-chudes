interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl animate-float" style={{ animationDelay: '0s' }}>🎄</div>
      <div className="absolute top-20 right-20 text-5xl animate-float" style={{ animationDelay: '0.5s' }}>⭐</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-float" style={{ animationDelay: '1s' }}>🎁</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-float" style={{ animationDelay: '1.5s' }}>🍊</div>
      
      <div className="text-center max-w-3xl">
        {/* Main title */}
        <h1 className="font-pacifico text-5xl md:text-7xl lg:text-8xl text-accent text-glow mb-6 leading-tight">
          Новогоднее
          <br />
          <span className="text-primary text-glow-red">Поле Чудес</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-foreground/90 mb-8 font-nunito">
          Взрываем ёлку, крутим барабан, орём буквы! 🎉
        </p>
        
        {/* Fun description */}
        <div className="bg-card/60 backdrop-blur-sm p-6 rounded-2xl border border-accent/30 mb-10">
          <p className="text-lg text-muted-foreground">
            Собирайтесь у одного экрана, разделитесь на три команды и устройте самый угарный новогодний баттл! 
            Здесь есть мандарины, банкрот и Дед Мороз с сомнительными шуточками. 🎅
          </p>
        </div>
        
        {/* Start button */}
        <button
          onClick={onStart}
          className="btn-accent text-2xl px-12 py-5 animate-pulse-glow"
        >
          🎄 Начать игру! 🎄
        </button>
        
        {/* Instructions hint */}
        <p className="text-muted-foreground mt-6 text-sm">
          3 команды • 3 слова • бесконечное веселье
        </p>
      </div>
    </div>
  );
}
