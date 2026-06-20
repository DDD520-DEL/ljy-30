import { useState } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { getDueLabel } from '@/utils/date';
import { ChevronDown, ChevronUp, Bell, X } from 'lucide-react';
import type { BorrowRecord } from '@/types';

interface ReturnReminderBannerProps {
  onItemClick: (record: BorrowRecord) => void;
}

export function ReturnReminderBanner({ onItemClick }: ReturnReminderBannerProps) {
  const { getDueReminders } = useBorrowStore();
  const reminders = getDueReminders();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (reminders.length === 0 || dismissed) return null;

  const overdueCount = reminders.filter((r) => r.status === 'overdue').length;
  const todayDueCount = reminders.length - overdueCount;

  const summaryText = [
    overdueCount > 0 ? `${overdueCount}个已逾期` : '',
    todayDueCount > 0 ? `${todayDueCount}个今日到期` : '',
  ].filter(Boolean).join('，');

  return (
    <div className="bg-gradient-to-r from-danger-500 to-warning-400 text-white animate-fade-in">
      <div className="max-w-md mx-auto">
        <div
          className="flex items-center justify-between px-5 py-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-5 h-5 shrink-0 animate-pulse-soft" />
            <span className="text-sm font-medium truncate">
              🔔 归还提醒：{summaryText}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDismissed(true);
              }}
              className="p-1 hover:bg-white/20 rounded-full transition-colors ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-3 space-y-2 animate-fade-in">
            {reminders.map((record) => {
              const dueInfo = getDueLabel(record.expectedReturnDate);
              return (
                <div
                  key={record.id}
                  onClick={() => onItemClick(record)}
                  className="flex items-center gap-3 bg-white/20 backdrop-blur rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/30 transition-all active:scale-[0.98]"
                >
                  <span className="text-2xl shrink-0">{record.itemEmoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{record.itemName}</p>
                    <p className="text-xs text-white/80">
                      {record.roommateName} · {dueInfo.text}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                      dueInfo.type === 'overdue'
                        ? 'bg-red-900/40 text-red-100'
                        : 'bg-yellow-900/40 text-yellow-100'
                    }`}
                  >
                    {dueInfo.type === 'overdue' ? '逾期' : '今日'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
