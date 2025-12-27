import { useEffect, useRef, useState } from 'react';
import { PlayerStats, RoundHistory } from '@/hooks/useGameState';
import { Confetti } from './Confetti';

const BASE = import.meta.env.BASE_URL;

interface FinalStatsProps {
  playerStats: Record<string, PlayerStats>;
  roundsHistory: RoundHistory[];
  onReset: () => void;
}

interface AwardCategory {
  title: string;
  emoji: string;
  winner: PlayerStats | null;
  description: string;
  isMain?: boolean;
}

// Компонент для показа одной номинации
function AwardReveal({
  award,
  showWinner,
  isMain,
  onNext,
  isLast
}: {
  award: AwardCategory;
  showWinner: boolean;
  isMain?: boolean;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Эффект софитов - много лучей */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Центральное свечение */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] bg-gradient-radial from-amber-500/30 via-transparent to-transparent animate-pulse" />

        {/* Основные софиты сверху */}
        <div className="absolute top-0 left-1/4 w-40 h-[150%] bg-gradient-to-b from-amber-400/40 to-transparent rotate-12 blur-2xl animate-spotlight-1" />
        <div className="absolute top-0 right-1/4 w-40 h-[150%] bg-gradient-to-b from-amber-400/40 to-transparent -rotate-12 blur-2xl animate-spotlight-2" />

        {/* Дополнительные софиты */}
        <div className="absolute top-0 left-[10%] w-24 h-[120%] bg-gradient-to-b from-yellow-300/30 to-transparent rotate-[25deg] blur-xl animate-spotlight-3" />
        <div className="absolute top-0 right-[10%] w-24 h-[120%] bg-gradient-to-b from-yellow-300/30 to-transparent -rotate-[25deg] blur-xl animate-spotlight-4" />
        <div className="absolute top-0 left-[40%] w-20 h-[130%] bg-gradient-to-b from-orange-400/25 to-transparent rotate-[5deg] blur-xl animate-spotlight-5" />
        <div className="absolute top-0 right-[40%] w-20 h-[130%] bg-gradient-to-b from-orange-400/25 to-transparent -rotate-[5deg] blur-xl animate-spotlight-6" />

        {/* Боковые лучи */}
        <div className="absolute top-1/4 left-0 w-[60%] h-32 bg-gradient-to-r from-amber-500/20 to-transparent blur-2xl animate-spotlight-side-1" />
        <div className="absolute top-1/4 right-0 w-[60%] h-32 bg-gradient-to-l from-amber-500/20 to-transparent blur-2xl animate-spotlight-side-2" />

        {/* Блики */}
        <div className="absolute top-[20%] left-[30%] w-4 h-4 bg-white/60 rounded-full blur-sm animate-sparkle-1" />
        <div className="absolute top-[15%] right-[35%] w-3 h-3 bg-white/50 rounded-full blur-sm animate-sparkle-2" />
        <div className="absolute top-[25%] left-[60%] w-2 h-2 bg-white/40 rounded-full blur-sm animate-sparkle-3" />
      </div>

      <div className="relative z-10 text-center px-8">
        {/* Эмодзи номинации */}
        <div className={`mb-8 animate-bounce-in ${isMain ? 'text-9xl' : 'text-8xl'}`}>
          {award.emoji}
        </div>

        {/* Название номинации */}
        <h2 className={`font-pacifico text-glow mb-6 animate-fade-in ${
          isMain ? 'text-5xl md:text-6xl text-amber-400' : 'text-4xl md:text-5xl text-accent'
        }`}>
          {award.title}
        </h2>

        {/* Описание */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {award.description}
        </p>

        {/* Победитель - появляется с задержкой */}
        {showWinner && award.winner && (
          <div className="animate-winner-reveal">
            <div className="inline-block bg-gradient-to-b from-amber-500/30 to-amber-600/10 backdrop-blur-sm p-8 rounded-3xl border-2 border-amber-500/50">
              <img
                src={award.winner.photo}
                alt={award.winner.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-amber-400 object-cover mx-auto mb-4 shadow-2xl"
              />
              <p className="text-3xl md:text-4xl font-bold text-foreground">
                {award.winner.name}
              </p>
            </div>
          </div>
        )}

        {/* Кнопка дальше - отдельно под карточкой */}
        {showWinner && (
          <button
            onClick={onNext}
            className="mt-10 btn-accent text-xl animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            {isLast ? '🎄 К итогам!' : '➡️ Дальше'}
          </button>
        )}

        {/* Ожидание победителя */}
        {!showWinner && (
          <div className="animate-pulse">
            <p className="text-2xl text-amber-400">И победитель...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function FinalStats({ playerStats, roundsHistory, onReset }: FinalStatsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const drumrollRef = useRef<HTMLAudioElement>(null);
  const players = Object.values(playerStats);

  // Состояние для анимации награждения
  const [currentAwardIndex, setCurrentAwardIndex] = useState(0);
  const [showWinner, setShowWinner] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);

  // Находим лидеров по разным категориям
  const getLeader = (selector: (p: PlayerStats) => number): PlayerStats | null => {
    if (players.length === 0) return null;
    const sorted = [...players].sort((a, b) => selector(b) - selector(a));
    return selector(sorted[0]) > 0 ? sorted[0] : null;
  };

  // Все номинации (основные + ироничные)
  const allAwards: AwardCategory[] = [
    {
      title: 'Главный Буквоед Года',
      emoji: '👑',
      winner: getLeader(p => p.totalPoints),
      description: `Набрал ${getLeader(p => p.totalPoints)?.totalPoints || 0} очков за игру`,
      isMain: true,
    },
    {
      title: 'Мастер Букв',
      emoji: '🔤',
      winner: getLeader(p => p.correctLetters),
      description: `Угадал ${getLeader(p => p.correctLetters)?.correctLetters || 0} букв`,
    },
    {
      title: 'Мистер/Мисс Банкрот',
      emoji: '💸',
      winner: getLeader(p => p.bankruptcies),
      description: `Обанкротился ${getLeader(p => p.bankruptcies)?.bankruptcies || 0} раз`,
    },
    {
      title: 'Коллекционер Подарков',
      emoji: '🎁',
      winner: getLeader(p => p.giftsReceived),
      description: `Собрал ${getLeader(p => p.giftsReceived)?.giftsReceived || 0} подарков`,
    },
    {
      title: 'Мимо Кассы',
      emoji: '❌',
      winner: getLeader(p => p.wrongLetters),
      description: `Ошибся ${getLeader(p => p.wrongLetters)?.wrongLetters || 0} раз`,
    },
    {
      title: 'Смелый, но Неверный',
      emoji: '🙈',
      winner: getLeader(p => p.wordsFailed),
      description: `Провалил ${getLeader(p => p.wordsFailed)?.wordsFailed || 0} попыток угадать слово`,
    },
  ].filter(a => a.winner !== null);

  // Логика показа номинаций по очереди
  useEffect(() => {
    if (revealComplete) return;

    // Играем барабанную дробь
    if (drumrollRef.current && !showWinner) {
      drumrollRef.current.currentTime = 0;
      drumrollRef.current.volume = 0.3;
      drumrollRef.current.play().catch(() => {});
    }

    // Через 3 секунды показываем победителя
    const winnerTimer = setTimeout(() => {
      setShowWinner(true);
      if (drumrollRef.current) {
        drumrollRef.current.pause();
      }
    }, 3000);

    return () => clearTimeout(winnerTimer);
  }, [currentAwardIndex, revealComplete]);

  // Переход к следующей номинации по клику на кнопку
  const handleNext = () => {
    if (currentAwardIndex < allAwards.length - 1) {
      setCurrentAwardIndex(prev => prev + 1);
      setShowWinner(false);
    } else {
      setRevealComplete(true);
      // Включаем финальную музыку
      if (audioRef.current) {
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const currentAward = allAwards[currentAwardIndex];

  // Показ номинаций по очереди
  if (!revealComplete && currentAward) {
    return (
      <>
        <audio ref={drumrollRef} src={`${BASE}sounds/wheel-spin.mp3`} />
        <style>{`
          @keyframes spotlight-1 {
            0%, 100% { transform: rotate(12deg) translateX(-30px); opacity: 0.4; }
            50% { transform: rotate(12deg) translateX(30px); opacity: 0.7; }
          }
          @keyframes spotlight-2 {
            0%, 100% { transform: rotate(-12deg) translateX(30px); opacity: 0.4; }
            50% { transform: rotate(-12deg) translateX(-30px); opacity: 0.7; }
          }
          @keyframes spotlight-3 {
            0%, 100% { transform: rotate(25deg) translateX(-15px); opacity: 0.3; }
            50% { transform: rotate(25deg) translateX(15px); opacity: 0.5; }
          }
          @keyframes spotlight-4 {
            0%, 100% { transform: rotate(-25deg) translateX(15px); opacity: 0.3; }
            50% { transform: rotate(-25deg) translateX(-15px); opacity: 0.5; }
          }
          @keyframes spotlight-5 {
            0%, 100% { transform: rotate(5deg) translateX(-10px); opacity: 0.25; }
            50% { transform: rotate(5deg) translateX(10px); opacity: 0.4; }
          }
          @keyframes spotlight-6 {
            0%, 100% { transform: rotate(-5deg) translateX(10px); opacity: 0.25; }
            50% { transform: rotate(-5deg) translateX(-10px); opacity: 0.4; }
          }
          @keyframes spotlight-side-1 {
            0%, 100% { transform: translateY(-20px); opacity: 0.2; }
            50% { transform: translateY(20px); opacity: 0.4; }
          }
          @keyframes spotlight-side-2 {
            0%, 100% { transform: translateY(20px); opacity: 0.2; }
            50% { transform: translateY(-20px); opacity: 0.4; }
          }
          @keyframes sparkle-1 {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }
          @keyframes sparkle-2 {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.9; transform: scale(1.3); }
          }
          @keyframes sparkle-3 {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.4); }
          }
          @keyframes winner-reveal {
            0% { transform: scale(0) rotate(-10deg); opacity: 0; }
            50% { transform: scale(1.1) rotate(5deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-spotlight-1 { animation: spotlight-1 2.5s ease-in-out infinite; }
          .animate-spotlight-2 { animation: spotlight-2 2.5s ease-in-out infinite 0.3s; }
          .animate-spotlight-3 { animation: spotlight-3 3s ease-in-out infinite 0.5s; }
          .animate-spotlight-4 { animation: spotlight-4 3s ease-in-out infinite 0.8s; }
          .animate-spotlight-5 { animation: spotlight-5 2s ease-in-out infinite 0.2s; }
          .animate-spotlight-6 { animation: spotlight-6 2s ease-in-out infinite 0.6s; }
          .animate-spotlight-side-1 { animation: spotlight-side-1 4s ease-in-out infinite; }
          .animate-spotlight-side-2 { animation: spotlight-side-2 4s ease-in-out infinite 1s; }
          .animate-sparkle-1 { animation: sparkle-1 1.5s ease-in-out infinite; }
          .animate-sparkle-2 { animation: sparkle-2 2s ease-in-out infinite 0.5s; }
          .animate-sparkle-3 { animation: sparkle-3 1.8s ease-in-out infinite 0.3s; }
          .animate-winner-reveal { animation: winner-reveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          .animate-fade-in { animation: fade-in 0.6s ease-out forwards; opacity: 0; }
        `}</style>
        <AwardReveal
          award={currentAward}
          showWinner={showWinner}
          isMain={currentAward.isMain}
          onNext={handleNext}
          isLast={currentAwardIndex === allAwards.length - 1}
        />
      </>
    );
  }

  // Финальный экран со всей статистикой
  return (
    <>
      <audio ref={audioRef} src={`${BASE}sounds/winner.mp3`} loop />
      <Confetti />
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-40 p-4 overflow-y-auto">
        <div className="max-w-4xl w-full my-8">
          <div className="text-center mb-8 animate-bounce-in">
            <div className="text-7xl mb-4 animate-float">🎄</div>
            <h1 className="font-pacifico text-4xl md:text-5xl text-accent text-glow mb-2">
              Игра Завершена!
            </h1>
            <p className="text-xl text-muted-foreground">
              Итоги новогоднего безумия 🎉
            </p>
          </div>

          {/* Все номинации */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {allAwards.map((award, index) => (
              <div
                key={award.title}
                className={`backdrop-blur-sm p-4 rounded-2xl border ${
                  award.isMain
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-600/10 border-amber-500/50 md:col-span-2'
                    : 'bg-card/50 border-accent/30'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={award.isMain ? 'text-5xl' : 'text-4xl'}>{award.emoji}</div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${award.isMain ? 'text-amber-400' : 'text-accent'}`}>
                      {award.title}
                    </h3>
                    <p className="text-foreground font-bold">{award.winner?.name}</p>
                    <p className="text-sm text-muted-foreground">{award.description}</p>
                  </div>
                  {award.winner && (
                    <img
                      src={award.winner.photo}
                      alt={award.winner.name}
                      className={`rounded-full object-cover ${
                        award.isMain
                          ? 'w-16 h-16 border-4 border-amber-400'
                          : 'w-12 h-12 border-2 border-accent/50'
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Топ игроков по очкам */}
          <div className="bg-card/30 backdrop-blur-sm p-4 rounded-2xl border border-accent/20 mb-8">
            <h3 className="font-pacifico text-xl text-center text-accent mb-4">
              Таблица Лидеров 🏅
            </h3>
            <div className="space-y-2">
              {[...players].sort((a, b) => b.totalPoints - a.totalPoints).map((player, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                return (
                  <div
                    key={player.name}
                    className={`flex items-center gap-4 p-3 rounded-xl ${
                      index === 0 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-background/30'
                    }`}
                  >
                    <span className="text-2xl w-10 text-center">{medal}</span>
                    <img
                      src={player.photo}
                      alt={player.name}
                      className={`w-10 h-10 rounded-full object-cover ${
                        index === 0 ? 'border-2 border-amber-400' : 'border border-accent/30'
                      }`}
                    />
                    <span className={`flex-1 font-bold ${index === 0 ? 'text-amber-400' : 'text-foreground'}`}>
                      {player.name}
                    </span>
                    <span className={`font-bold text-lg ${index === 0 ? 'text-amber-400' : 'text-accent'}`}>
                      {player.totalPoints} очков
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Кнопка перезапуска */}
          <div className="text-center">
            <button onClick={onReset} className="btn-accent text-xl">
              🔄 Сыграть ещё раз
            </button>
            <p className="mt-4 text-muted-foreground">
              С Новым Годом! 🎄✨
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
