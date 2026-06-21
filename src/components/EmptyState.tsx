import { EMPTY_MESSAGES, CHORE_EMPTY_MESSAGES, WISH_EMPTY_MESSAGES } from '@/data/constants';
import { useMemo } from 'react';

interface EmptyStateProps {
  type?: 'active' | 'history' | 'overdue' | 'search' | 'no-tasks' | 'no-assignments' | 'wish-all' | 'wish-active' | 'wish-fulfilled' | 'wish-archived';
}

export function EmptyState({ type = 'active' }: EmptyStateProps) {
  const message = useMemo(() => {
    let messages;
    if (type === 'no-tasks') {
      messages = CHORE_EMPTY_MESSAGES.noTasks;
    } else if (type === 'no-assignments') {
      messages = CHORE_EMPTY_MESSAGES.noAssignments;
    } else if (type === 'wish-all') {
      messages = WISH_EMPTY_MESSAGES.all;
    } else if (type === 'wish-active') {
      messages = WISH_EMPTY_MESSAGES.active;
    } else if (type === 'wish-fulfilled') {
      messages = WISH_EMPTY_MESSAGES.fulfilled;
    } else if (type === 'wish-archived') {
      messages = WISH_EMPTY_MESSAGES.archived;
    } else {
      messages = EMPTY_MESSAGES[type];
    }
    return messages[Math.floor(Math.random() * messages.length)];
  }, [type]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="text-6xl mb-4 animate-float">{message.emoji}</div>
      <p className="text-gray-500 text-center text-sm">{message.text}</p>
    </div>
  );
}
