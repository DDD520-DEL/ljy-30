import { useBorrowStore } from '@/store/useBorrowStore';
import type { BorrowRecord } from '@/types';
import { formatDateShort, getDueLabel } from '@/utils/date';
import { X, Check, Trash2, ArrowUpRight, ArrowDownLeft, Package, AlertTriangle } from 'lucide-react';

interface RecordDetailModalProps {
  record: BorrowRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onReturn: () => void;
}

export function RecordDetailModal({ record, isOpen, onClose, onReturn }: RecordDetailModalProps) {
  const { deleteRecord, getInventoryItemById } = useBorrowStore();

  if (!record || !isOpen) return null;

  const isLend = record.type === 'lend';
  const isReturned = record.status === 'returned';
  const dueInfo = getDueLabel(record.expectedReturnDate);
  const inventoryItem = record.itemId ? getInventoryItemById(record.itemId) : undefined;
  const isLowStock = inventoryItem && inventoryItem.currentQuantity <= inventoryItem.threshold;

  const handleDelete = () => {
    if (confirm('确定要删除这条记录吗？')) {
      deleteRecord(record.id);
      onClose();
    }
  };

  const getDueBadgeStyle = () => {
    switch (dueInfo.type) {
      case 'overdue':
        return 'bg-danger-100 text-danger-700 border-danger-200';
      case 'today':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'soon':
        return 'bg-warning-50 text-warning-600 border-warning-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-4xl">{record.itemEmoji}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{record.itemName}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1 mt-1 ${
                isLend ? 'text-primary-600 border-primary-200 bg-primary-50' : 'text-purple-600 border-purple-200 bg-purple-50'
              }`}>
                {isLend ? (
                  <><ArrowUpRight className="w-3 h-3" /> 借出</>
                ) : (
                  <><ArrowDownLeft className="w-3 h-3" /> 借入</>
                )}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <span className="text-3xl">{record.roommateAvatar}</span>
            <div>
              <p className="font-medium text-gray-800">{record.roommateName}</p>
              <p className="text-sm text-gray-500">
                {isLend ? 'TA借了我的' : '我借了TA的'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">借出日期</p>
              <p className="font-medium text-gray-800">
                📅 {formatDateShort(record.borrowDate)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">预期归还</p>
              <p className={`font-medium ${isReturned ? 'text-gray-500 line-through' : ''}`}>
                ⏰ {formatDateShort(record.expectedReturnDate)}
              </p>
            </div>
          </div>

          {!isReturned && (
            <div className={`p-3 rounded-xl border ${getDueBadgeStyle()} text-center`}>
              <span className="font-medium">{dueInfo.text}</span>
            </div>
          )}

          {isReturned && record.actualReturnDate && (
            <div className="p-3 bg-success-50 border border-success-200 rounded-xl text-center">
              <span className="font-medium text-success-700">
                ✅ 已于 {formatDateShort(record.actualReturnDate)} 归还
              </span>
            </div>
          )}

          {inventoryItem && (
            <div className={`p-4 rounded-2xl ${
              isLowStock ? 'bg-warning-50 border border-warning-200' : 'bg-purple-50 border border-purple-100'
            }`}>
              <p className={`text-xs mb-2 flex items-center gap-1 ${
                isLowStock ? 'text-warning-600' : 'text-purple-600'
              }`}>
                <Package className="w-3.5 h-3.5" />
                库存信息
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">当前库存</span>
                  <span className={`font-bold ${
                    inventoryItem.currentQuantity <= 0 ? 'text-danger-500' :
                    isLowStock ? 'text-warning-600' : 'text-success-600'
                  }`}>
                    {inventoryItem.currentQuantity} {inventoryItem.unit}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      inventoryItem.currentQuantity <= 0 ? 'bg-danger-400' :
                      isLowStock ? 'bg-warning-400' : 'bg-success-400'
                    }`}
                    style={{
                      width: `${inventoryItem.totalQuantity > 0 ? (inventoryItem.currentQuantity / inventoryItem.totalQuantity) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>总量: {inventoryItem.totalQuantity} {inventoryItem.unit}</span>
                  <span>安全阈值: {inventoryItem.threshold} {inventoryItem.unit}</span>
                </div>
                {record.quantity && record.quantity > 1 && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600">本次借出</span>
                    <span className="font-medium text-gray-800">
                      {record.quantity} {inventoryItem.unit}
                    </span>
                  </div>
                )}
                {isLowStock && !isReturned && (
                  <div className="flex items-center gap-1.5 pt-2 text-warning-600 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>库存不足，建议尽快补货</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {record.note && (
            <div className="p-4 bg-amber-50 rounded-2xl">
              <p className="text-xs text-amber-600 mb-1">📝 备注</p>
              <p className="text-gray-700 text-sm">{record.note}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          {!isReturned && (
            <button
              onClick={onReturn}
              className="flex-1 py-4 bg-gradient-to-r from-success-400 to-success-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              确认归还
            </button>
          )}
          <button
            onClick={handleDelete}
            className={`p-4 rounded-2xl transition-all flex items-center justify-center ${
              isReturned ? 'flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-100 text-gray-600 hover:bg-danger-100 hover:text-danger-600'
            }`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
