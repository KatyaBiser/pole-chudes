import { useEffect, useRef } from 'react';
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

export function FinalStats({ playerStats, roundsHistory, onReset }: FinalStatsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const players = Object.values(playerStats);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }

    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // Находим лидеров по разным категориям
  const getLeader = (selector: (p: PlayerStats) => number): PlayerStats | null => {
    if (players.length === 0) return null;
    const sorted = [...players].sort((a, b) => selector(b) - selector(a));
    return selector(sorted[0]) > 0 ? sorted[0] : null;
  };

  const getLoser = (selector: (p: PlayerStats) => number): PlayerStats | null => {
    if (players.length === 0) return null;
    const sorted = [...players].sort((a, b) => selector(b) - selector(a));
    return selector(sorted[sorted.length - 1]) > 0 ? sorted[sorted.length - 1] : null;
  };

  // Основные награды
  const awards: AwardCategory[] = [
    {
      title: 'Главный Буквоед',
      emoji: '👑',
      winner: getLeader(p => p.totalPoints),
      description: `${getLeader(p => p.totalPoints)?.totalPoints || 0} очков`,
      isMain: true,
    },
    {
      title: 'Мастер Букв',
      emoji: '🔤',
      winner: getLeader(p => p.correctLetters),
      description: `${getLeader(p => p.correctLetters)?.correctLetters || 0} верных букв`,
    },
    {
      title: 'Телепат Слов',
      emoji: '🔮',
      winner: getLeader(p => p.wordsGuessed),
      description: `${getLeader(p => p.wordsGuessed)?.wordsGuessed || 0} угаданных слов`,
    },
    {
      title: 'Победитель Туров',
      emoji: '🏆',
      winner: getLeader(p => p.roundsWon),
      description: `${getLeader(p => p.roundsWon)?.roundsWon || 0} побед`,
    },
  ];

  // Ироничные награды
  const funnyAwards: AwardCategory[] = [
    {
      title: 'Мистер/Мисс Банкрот',
      emoji: '💸',
      winner: getLeader(p => p.bankruptcies),
      description: `${getLeader(p => p.bankruptcies)?.bankruptcies || 0} банкротств`,
    },
    {
      title: 'Коллекционер Подарков',
      emoji: '🎁',
      winner: getLeader(p => p.giftsReceived),
      description: `${getLeader(p => p.giftsReceived)?.giftsReceived || 0} подарков`,
    },
    {
      title: 'Мимо кассы',
      emoji: '❌',
      winner: getLeader(p => p.wrongLetters),
      description: `${getLeader(p => p.wrongLetters)?.wrongLetters || 0} ошибок`,
    },
    {
      title: 'Смелый, но неверный',
      emoji: '🙈',
      winner: getLeader(p => p.wordsFailed),
      description: `${getLeader(p => p.wordsFailed)?.wordsFailed || 0} провальных слов`,
    },
  ];

  // Выбираем только те награды где есть победитель и значение > 0
  const validAwards = awards.filter(a => a.winner !== null);
  const validFunnyAwards = funnyAwards.filter(a => a.winner !== null);

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

          {/* Главный победитель */}
          {validAwards[0] && validAwards[0].winner && (
            <div className="bg-gradient-to-b from-amber-500/20 to-amber-600/10 backdrop-blur-sm p-6 md:p-8 rounded-3xl border-2 border-amber-500/50 mb-8 text-center animate-bounce-in">
              <div className="text-6xl mb-4">👑</div>
              <h2 className="font-pacifico text-3xl md:text-4xl text-amber-400 mb-4">
                Главный Буквоед Года!
              </h2>
              <div className="flex flex-col items-center gap-4">
                <img
                  src={validAwards[0].winner.photo}
                  alt={validAwards[0].winner.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-amber-400 object-cover"
                />
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    {validAwards[0].winner.name}
                  </p>
                  <p className="text-xl text-amber-400 font-bold">
                    {validAwards[0].winner.totalPoints} очков! 🏆
                  </p>
                </div>
              </div>
              <p className="mt-4 text-lg text-muted-foreground italic">
                Получает специальный приз: VIP-место у ёлки и лучший кусок торта!
              </p>
            </div>
          )}

          {/* Остальные награды */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {validAwards.slice(1).map((award, index) => (
              <div
                key={award.title}
                className="bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-accent/30"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{award.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-accent text-lg">{award.title}</h3>
                    <p className="text-foreground font-bold">{award.winner?.name}</p>
                    <p className="text-sm text-muted-foreground">{award.description}</p>
                  </div>
                  {award.winner && (
                    <img
                      src={award.winner.photo}
                      alt={award.winner.name}
                      className="w-12 h-12 rounded-full border-2 border-accent/50 object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Ироничные награды */}
          {validFunnyAwards.length > 0 && (
            <>
              <h2 className="font-pacifico text-2xl text-center text-accent mb-4">
                Особые Номинации 🎭
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {validFunnyAwards.map((award, index) => (
                  <div
                    key={award.title}
                    className="bg-card/30 backdrop-blur-sm p-4 rounded-2xl border border-muted/30"
                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{award.emoji}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-muted-foreground">{award.title}</h3>
                        <p className="text-foreground font-bold">{award.winner?.name}</p>
                        <p className="text-sm text-muted-foreground">{award.description}</p>
                      </div>
                      {award.winner && (
                        <img
                          src={award.winner.photo}
                          alt={award.winner.name}
                          className="w-10 h-10 rounded-full border border-muted/50 object-cover opacity-80"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* История раундов */}
          <div className="bg-card/30 backdrop-blur-sm p-4 rounded-2xl border border-accent/20 mb-8">
            <h3 className="font-pacifico text-xl text-center text-accent mb-4">
              История Раундов 📜
            </h3>
            <div className="space-y-2">
              {roundsHistory.map((round, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-background/30 p-3 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-accent font-bold">Раунд {index + 1}</span>
                    <span className="text-foreground font-bold">{round.word}</span>
                  </div>
                  <div className="text-right">
                    {round.winnerName ? (
                      <span className="text-accent">🏆 {round.winnerName}</span>
                    ) : (
                      <span className="text-muted-foreground">Без победителя</span>
                    )}
                  </div>
                </div>
              ))}
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
