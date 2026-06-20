import { useState, useEffect } from 'react';
import { CELEBRATION_EMOJIS } from '@/data/constants';
import type { CelebrationEmoji } from '@/types';

interface CelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Celebration({ trigger, onComplete }: CelebrationProps) {
  const [emojis, setEmojis] = useState<CelebrationEmoji[]>([]);

  useEffect(() => {
    if (trigger) {
      const newEmojis: CelebrationEmoji[] = [];
      const count = Math.floor(Math.random() * 5) + 8;

      for (let i = 0; i < count; i++) {
        newEmojis.push({
          id: i,
          emoji: CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)],
          left: Math.random() * 80 + 10,
          delay: Math.random() * 0.3,
        });
      }

      setEmojis(newEmojis);

      const timer = setTimeout(() => {
        setEmojis([]);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (emojis.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {emojis.map((item) => (
        <div
          key={item.id}
          className="absolute bottom-1/3 text-3xl animate-confetti"
          style={{
            left: `${item.left}%`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}
