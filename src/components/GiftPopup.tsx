interface GiftPopupProps {
  giftName: string;
  giftEmoji: string;
  onClose: () => void;
}

export function GiftPopup({ giftName, giftEmoji, onClose }: GiftPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border-2 border-accent rounded-3xl p-8 max-w-md mx-4 animate-bounce-in text-center">
        <div className="text-8xl mb-6">{giftEmoji}</div>

        <h2 className="font-pacifico text-3xl text-accent mb-4">
          Подарок!
        </h2>

        <p className="text-xl text-foreground mb-6">
          Вы получили: <span className="font-bold text-accent">{giftName}</span>
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Подарок добавлен в вашу коллекцию!<br/>
          Ход остаётся у вас — крутите барабан снова!
        </p>

        <button
          onClick={onClose}
          className="btn-accent text-xl px-8 py-3"
        >
          Отлично! 🎉
        </button>
      </div>
    </div>
  );
}
