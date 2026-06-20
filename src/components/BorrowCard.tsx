import type { BorrowRecord } from '@/types';
import { getDueLabel } from '@/utils/date';
import { Check, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface BorrowCardProps {
  record: BorrowRecord;
  onClick?: () => void;
  onReturn?: () => void;
  isReturned?: boolean;
}

export function BorrowCard({ record, onClick, onReturn, isReturned = false }: BorrowCardProps) {
  const dueInfo = getDueLabel(record.expectedReturnDate);
  const isLend = record.type === 'lend';

  const getBorderColor = () => {
    if (isReturned) return 'border-gray-200';
    if (record.status === 'overdue') return 'border-danger-400';
    if (isLend) return 'border-primary-300';
    return 'border-purple-300';
  };

  const getLeftBarColor = () => {
    if (isReturned) return 'bg-gray-300';
    if (record.status === 'overdue') return 'bg-danger-500';
    if (isLend) return 'bg-primary-400';
    return 'bg-purple-400';
  };

  const getDueBadgeStyle = () => {
    switch (dueInfo.type) {
      case 'overdue':
        return 'bg-danger-100 text-danger-700 border-danger-200';
      case 'today':
        return 'bg-warning-100 text-warning-700 border-warning-200 animate-pulse';
      case 'soon':
        return 'bg-warning-50 text-warning-600 border-warning-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-4 shadow-sm border-l-4 ${getBorderColor()} ${getLeftBarColor()} 
        hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden
        ${isReturned ? 'opacity-60' : ''}
        ${record.status === 'overdue' && !isReturned ? 'animate-pulse-soft' : ''}
        animate-slide-up`}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl flex-shrink-0">{record.itemEmoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold text-gray-800 truncate ${isReturned ? 'line-through text-gray-500' : ''}`}>
              {record.itemName}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full border flex-shrink-0">
              {isLend ? (
                <span className="flex items-center gap-1 text-primary-600">
                  <ArrowUpRight className="w-3 h-3" />
                  借出
                </span>
              ) : (
                <span className="flex items-center gap-1 text-purple-600">
                  <ArrowDownLeft className="w-3 h-3" />
                  借入
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-lg">{record.roommateAvatar}</span>
            <span>{record.roommateName}</span>
            {isLend ? <span className="text-gray-400">借了我的</span> : <span className="text-gray-400">借我的</span>}
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-xs px-2.5 py-1 rounded-full border ${getDueBadgeStyle()}`}>
              {isReturned ? '✅ 已归还' : dueInfo.text}
            </span>

            {!isReturned && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReturn?.();
                }}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-success-500 text-white rounded-full hover:bg-success-600 transition-all active:scale-95"
              >
                <Check className="w-3 h-3" />
                归还
              </button>
            )}
          </div>
        </div>
      </div>

      {record.note && !isReturned && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-start gap-1">
          <span>📝</span>
          <span className="truncate">{record.note}</span>
        </div>
      )}

      {isReturned && record.actualReturnDate && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1">
          <span>📅</span>
          <span>归还于 {new Date(record.actualReturnDate).toLocaleDateString('zh-CN')}</span>
        </div>
      )}
    </div>
  );
}
