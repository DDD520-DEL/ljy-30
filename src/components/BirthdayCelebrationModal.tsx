import { useState, useEffect, useMemo } from 'react';
import { X, Cake, Home as HomeIcon } from 'lucide-react';
import type { Roommate } from '@/types';
import { getAge, getYearsSinceMoveIn } from '@/utils/date';
import type { CelebrationEmoji } from '@/types';

interface BirthdayCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthdayRoommates?: Roommate[];
  anniversaryRoommates?: Roommate[];
}

export function BirthdayCelebrationModal({
  isOpen,
  onClose,
  birthdayRoommates = [],
  anniversaryRoommates = [],
}: BirthdayCelebrationModalProps) {
  const [emojis, setEmojis] = useState<CelebrationEmoji[]>([]);
  const [showContent, setShowContent] = useState(false);

  const confettiEmojis = useMemo(
    () => ['🎉', '🎊', '🎁', '🎂', '🎈', '✨', '🌟', '💫', '🎀', '🥳', '🎆', '🎇'],
    []
  );

  useEffect(() => {
    if (isOpen) {
      setShowContent(false);
      const newEmojis: CelebrationEmoji[] = [];
      const count = 30;

      for (let i = 0; i < count; i++) {
        newEmojis.push({
          id: i,
          emoji: confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)],
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
        });
      }

      setEmojis(newEmojis);

      const contentTimer = setTimeout(() => {
        setShowContent(true);
      }, 300);

      return () => clearTimeout(contentTimer);
    } else {
      setEmojis([]);
      setShowContent(false);
    }
  }, [isOpen, confettiEmojis]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gradient-to-b from-pink-900/80 via-purple-900/80 to-indigo-900/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {emojis.map((item) => (
          <div
            key={item.id}
            className="absolute text-3xl animate-birthday-fall"
            style={{
              left: `${item.left}%`,
              animationDelay: `${item.delay}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      <div
        className={`relative z-10 w-full max-w-sm mx-4 transition-all duration-500 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-white border border-white/20">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>

            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
              特别的日子
            </h2>

            {birthdayRoommates.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Cake className="w-5 h-5 text-pink-300" />
                  <span className="text-lg font-medium">生日快乐</span>
                </div>
                <div className="space-y-3">
                  {birthdayRoommates.map((roommate) => (
                    <div
                      key={roommate.id}
                      className="flex items-center gap-3 bg-white/10 rounded-2xl p-3"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: roommate.color + '40' }}
                      >
                        {roommate.avatar}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{roommate.name}</p>
                        <p className="text-sm text-white/70">
                          {getAge(roommate.birthday!)} 岁啦！🎂
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {anniversaryRoommates.length > 0 && (
              <div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <HomeIcon className="w-5 h-5 text-blue-300" />
                  <span className="text-lg font-medium">入住纪念日</span>
                </div>
                <div className="space-y-3">
                  {anniversaryRoommates.map((roommate) => (
                    <div
                      key={roommate.id}
                      className="flex items-center gap-3 bg-white/10 rounded-2xl p-3"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: roommate.color + '40' }}
                      >
                        {roommate.avatar}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{roommate.name}</p>
                        <p className="text-sm text-white/70">
                          入住 {getYearsSinceMoveIn(roommate.moveInDate!)} 周年 🏠
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl font-medium hover:opacity-90 transition-opacity shadow-lg"
              >
                一起庆祝吧！🎊
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
