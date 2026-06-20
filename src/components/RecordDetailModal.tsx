import { useState } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import type { BorrowRecord } from '@/types';
import { formatDateShort, getDueLabel } from '@/utils/date';
import { X, Check, Trash2, ArrowUpRight, ArrowDownLeft, Package, AlertTriangle, AlertCircle, DollarSign } from 'lucide-react';

interface RecordDetailModalProps {
  record: BorrowRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onReturn: (options?: { isDamaged?: boolean; damageDescription?: string; compensationAmount?: number }) => void;
  onOpenCompensation?: (borrowRecordId: string) => void;
}

export function RecordDetailModal({ record, isOpen, onClose, onReturn, onOpenCompensation }: RecordDetailModalProps) {
  const { deleteRecord, getInventoryItemById, getCompensationByRecordId } = useBorrowStore();

  const [isDamaged, setIsDamaged] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [compensationAmount, setCompensationAmount] = useState('');

  if (!record || !isOpen) return null;

  const isLend = record.type === 'lend';
  const isReturned = record.status === 'returned';
  const dueInfo = getDueLabel(record.expectedReturnDate);
  const inventoryItem = record.itemId ? getInventoryItemById(record.itemId) : undefined;
  const isLowStock = inventoryItem && inventoryItem.currentQuantity <= inventoryItem.threshold;
  const compensation = getCompensationByRecordId(record.id);

  const handleDelete = () => {
    if (confirm('确定要删除这条记录吗？')) {
      deleteRecord(record.id);
      onClose();
    }
  };

  const handleReturn = () => {
    if (isDamaged && !damageDescription.trim()) {
      alert('请填写损坏描述');
      return;
    }
    if (isDamaged && compensationAmount && (parseFloat(compensationAmount) < 0 || isNaN(parseFloat(compensationAmount)))) {
      alert('请输入有效的赔偿金额');
      return;
    }
    onReturn({
      isDamaged,
      damageDescription: isDamaged ? damageDescription.trim() : undefined,
      compensationAmount: isDamaged && compensationAmount ? parseFloat(compensationAmount) : undefined,
    });
    setIsDamaged(false);
    setDamageDescription('');
    setCompensationAmount('');
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

          {record.isDamaged && (
            <div className="p-4 bg-danger-50 border border-danger-200 rounded-2xl">
              <p className="text-xs text-danger-600 mb-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                物品损坏
              </p>
              <p className="text-gray-700 text-sm">{record.damageDescription}</p>
              {compensation && (
                <button
                  onClick={() => onOpenCompensation?.(record.id)}
                  className={`mt-3 w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    compensation.status === 'pending'
                      ? 'bg-warning-500 text-white hover:bg-warning-600'
                      : 'bg-success-100 text-success-700 hover:bg-success-200'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  {compensation.status === 'pending'
                    ? `待赔偿 ¥${compensation.amount}`
                    : `已赔偿 ¥${compensation.amount}`}
                </button>
              )}
            </div>
          )}

          {!isReturned && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isDamaged
                      ? 'bg-danger-500 border-danger-500'
                      : 'border-gray-300 bg-white'
                  }`}
                  onClick={() => setIsDamaged(!isDamaged)}
                >
                  {isDamaged && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-danger-500" />
                    物品损坏
                  </p>
                  <p className="text-xs text-gray-500">归还时物品有损坏，需要记录并协商赔偿</p>
                </div>
              </label>

              {isDamaged && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      损坏描述 <span className="text-danger-500">*</span>
                    </label>
                    <textarea
                      value={damageDescription}
                      onChange={(e) => setDamageDescription(e.target.value)}
                      placeholder="请描述物品损坏情况..."
                      rows={2}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-danger-400 outline-none transition-colors resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      协商赔偿金额 <span className="text-gray-400">(选填，单位：元)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">¥</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={compensationAmount}
                        onChange={(e) => setCompensationAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-danger-400 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
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
                      width: `${Math.min(100, inventoryItem.totalQuantity > 0 ? (inventoryItem.currentQuantity / inventoryItem.totalQuantity) * 100 : 0)}%`,
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
              onClick={handleReturn}
              disabled={isDamaged && !damageDescription.trim()}
              className="flex-1 py-4 bg-gradient-to-r from-success-400 to-success-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              {isDamaged ? '确认归还并记录' : '确认归还'}
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
