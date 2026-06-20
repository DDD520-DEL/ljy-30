import { EMPTY_MESSAGES } from '@/data/constants';
import { useMemo } from 'react';

interface EmptyStateProps {
  type?: 'active' | 'history' | 'overdue' | 'search';
}

export function EmptyState({ type = 'active' }: EmptyStateProps) {
  const message = useMemo(() => {
    const messages = EMPTY_MESSAGES[type];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [type]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="text-6xl mb-4 animate-float">{message.emoji}</div>
      <p className="text-gray-500 text-center text-sm">{message.text}</p>
    </div>
  );
}
