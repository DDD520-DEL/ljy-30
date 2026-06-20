import type { BorrowRecord } from '@/types';
import { getDueLabel, isOverdue } from '@/utils/date';
import { Check, ArrowUpRight, ArrowDownLeft, Package } from 'lucide-react';
import { useBorrowStore } from '@/store/useBorrowStore';

interface BorrowCardProps {
  record: BorrowRecord;
  onClick?: () => void;
  onReturn?: () => void;
  isReturned?: boolean;
}

export function BorrowCard({ record, onClick, onReturn, isReturned = false }: BorrowCardProps) {
  const { getInventoryItemById } = useBorrowStore();
  const dueInfo = getDueLabel(record.expectedReturnDate);
  const isLend = record.type === 'lend';
  const isRecordOverdue = !isReturned && isOverdue(record.expectedReturnDate);

  const inventoryItem = record.itemId ? getInventoryItemById(record.itemId) : undefined;
  const isLowStock = inventoryItem && inventoryItem.currentQuantity <= inventoryItem.threshold;

  const getBorderColor = () => {
    if (isReturned) return 'border-gray-200';
    if (isRecordOverdue) return 'border-danger-400';
    if (isLend) return 'border-primary-300';
    return 'border-purple-300';
  };

  const getLeftBarColor = () => {
    if (isReturned) return 'bg-gray-300';
    if (isRecordOverdue) return 'bg-danger-500';
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

  const getStockStatusColor = () => {
    if (!inventoryItem) return 'text-gray-500';
    if (inventoryItem.currentQuantity <= 0) return 'text-danger-500';
    if (isLowStock) return 'text-warning-500';
    return 'text-success-500';
  };

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-4 shadow-sm border-l-4 ${getBorderColor()} ${getLeftBarColor()} 
        hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden
        ${isReturned ? 'opacity-60' : ''}
        ${isRecordOverdue ? 'animate-pulse-soft' : ''}
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
            {record.quantity && record.quantity > 1 && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                ×{record.quantity}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-lg">{record.roommateAvatar}</span>
            <span>{record.roommateName}</span>
            {isLend ? <span className="text-gray-400">借了我的</span> : <span className="text-gray-400">借我的</span>}
          </div>

          {inventoryItem && (
            <div className="flex items-center gap-2 mb-2">
              <Package className={`w-3.5 h-3.5 ${getStockStatusColor()}`} />
              <span className={`text-xs font-medium ${getStockStatusColor()}`}>
                库存: {inventoryItem.currentQuantity}{inventoryItem.unit}
              </span>
              {isLowStock && !isReturned && (
                <span className="text-xs text-warning-600 bg-warning-100 px-1.5 py-0.5 rounded">
                  库存不足
                </span>
              )}
            </div>
          )}

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
