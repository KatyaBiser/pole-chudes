interface PrizePopupProps {
  prize: string;
  onClose: () => void;
  onTakePrize?: () => void;
  showChoice?: boolean;
}

export function PrizePopup({ prize, onClose, onTakePrize, showChoice = false }: PrizePopupProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border-2 border-accent rounded-3xl p-8 max-w-md w-full animate-bounce-in box-glow">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">🎁</div>
          <h3 className="font-pacifico text-3xl text-accent text-glow mb-4">
            Новогодний приз!
          </h3>
          <p className="text-xl text-foreground mb-6 leading-relaxed">
            {prize}
          </p>
          
          {showChoice ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={onTakePrize} className="btn-primary">
                🎁 Забрать приз и выйти
              </button>
              <button onClick={onClose} className="btn-secondary">
                🎮 Продолжить игру
              </button>
            </div>
          ) : (
            <button onClick={onClose} className="btn-accent">
              Ура! Забираю! 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
