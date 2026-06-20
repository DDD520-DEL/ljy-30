import { useBorrowStore } from '@/store/useBorrowStore';
import { formatDateShort } from '@/utils/date';
import { X, Check, DollarSign, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

interface CompensationModalProps {
  borrowRecordId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompensationModal({ borrowRecordId, isOpen, onClose }: CompensationModalProps) {
  const { getCompensationByRecordId, updateCompensationStatus, deleteCompensationRecord } = useBorrowStore();

  if (!borrowRecordId || !isOpen) return null;

  const compensation = getCompensationByRecordId(borrowRecordId);

  if (!compensation) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              赔偿记录
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="py-8 text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500">暂无赔偿记录</p>
          </div>
        </div>
      </div>
    );
  }

  const isPending = compensation.status === 'pending';

  const handleMarkPaid = () => {
    if (confirm('确认已收到赔偿款？')) {
      updateCompensationStatus(compensation.id, 'paid');
    }
  };

  const handleMarkPending = () => {
    if (confirm('确认将状态改回待赔偿？')) {
      updateCompensationStatus(compensation.id, 'pending');
    }
  };

  const handleDelete = () => {
    if (confirm('确定要删除这条赔偿记录吗？')) {
      deleteCompensationRecord(compensation.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            赔偿记录
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className={`p-5 rounded-2xl mb-4 ${
          isPending
            ? 'bg-warning-50 border-2 border-warning-200'
            : 'bg-success-50 border-2 border-success-200'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{compensation.itemEmoji}</span>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-lg">{compensation.itemName}</p>
              <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                isPending
                  ? 'bg-warning-500 text-white'
                  : 'bg-success-500 text-white'
              }`}>
                {isPending ? (
                  <><Clock className="w-3 h-3" /> 待赔偿</>
                ) : (
                  <><CheckCircle className="w-3 h-3" /> 已赔偿</>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/70 rounded-xl p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-500">赔偿金额</span>
              <span className={`text-3xl font-bold ${
                isPending ? 'text-warning-600' : 'text-success-600'
              }`}>
                ¥{compensation.amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl">{compensation.roommateAvatar}</span>
            <div>
              <p className="font-medium text-gray-800">{compensation.roommateName}</p>
              <p className="text-xs text-gray-500">赔偿责任人</p>
            </div>
          </div>

          <div className="p-4 bg-danger-50 rounded-xl border border-danger-100">
            <p className="text-xs text-danger-600 mb-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              损坏描述
            </p>
            <p className="text-gray-700 text-sm">{compensation.damageDescription}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">创建时间</p>
              <p className="font-medium text-gray-800 text-sm">
                📅 {formatDateShort(compensation.createdAt)}
              </p>
            </div>
            {compensation.paidAt && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">赔偿时间</p>
                <p className="font-medium text-gray-800 text-sm">
                  ✅ {formatDateShort(compensation.paidAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {isPending ? (
            <button
              onClick={handleMarkPaid}
              className="flex-1 py-4 bg-gradient-to-r from-success-400 to-success-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              确认已赔偿
            </button>
          ) : (
            <button
              onClick={handleMarkPending}
              className="flex-1 py-4 bg-gradient-to-r from-warning-400 to-warning-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5" />
              改为待赔偿
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-4 rounded-2xl bg-gray-100 text-gray-600 hover:bg-danger-100 hover:text-danger-600 transition-all flex items-center justify-center"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
