import { useState } from 'react';
import type { Bill } from '@/types';
import { useBorrowStore } from '@/store/useBorrowStore';
import { Check, ChevronDown, ChevronUp, Trash2, UserCheck, UserX } from 'lucide-react';

interface BillCardProps {
  bill: Bill;
}

export function BillCard({ bill }: BillCardProps) {
  const { markBillParticipantPaid, deleteBill } = useBorrowStore();
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const paidCount = bill.participants.filter((p) => p.paid).length;
  const totalParticipants = bill.participants.length;
  const isSettled = bill.status === 'settled';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusStyle = () => {
    if (isSettled) {
      return 'border-success-300 bg-success-50';
    }
    return 'border-warning-300 bg-warning-50';
  };

  const getStatusText = () => {
    if (isSettled) return '✅ 已结清';
    return `⏳ ${paidCount}/${totalParticipants} 已付`;
  };

  const handleMarkPaid = (roommateId: string) => {
    markBillParticipantPaid(bill.id, roommateId);
  };

  const handleDelete = () => {
    deleteBill(bill.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-sm border-l-4 ${
        isSettled ? 'border-success-400' : 'border-warning-400'
      } hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden animate-slide-up`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-4xl flex-shrink-0">{bill.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={`font-bold text-gray-800 truncate ${isSettled ? 'text-gray-500' : ''}`}>
                {bill.title}
              </h3>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="p-1.5 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors"
                    title="确认删除"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(false);
                    }}
                    className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                    title="取消"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors flex-shrink-0"
                  title="删除账单"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="text-lg">{bill.payerAvatar}</span>
              <span>{bill.payerName} 垫付</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-800">
                ¥{bill.totalAmount.toFixed(2)}
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusStyle()}`}
              >
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>{formatDate(bill.billDate)}</span>
          <div className="flex items-center gap-1">
            <span>{expanded ? '收起详情' : '查看明细'}</span>
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
            {bill.note && (
              <div className="mb-3 text-xs text-gray-500 flex items-start gap-1.5">
                <span>📝</span>
                <span>{bill.note}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 mb-1">分摊明细：</div>
              {bill.participants.map((p) => (
                <div
                  key={p.roommateId}
                  className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.roommateAvatar}</span>
                    <span className={`text-sm font-medium ${p.paid ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {p.roommateName}
                    </span>
                    {p.roommateId === bill.payerId && (
                      <span className="text-xs px-1.5 py-0.5 bg-primary-100 text-primary-600 rounded-full">
                        垫付人
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        p.paid ? 'text-success-500' : 'text-warning-600'
                      }`}
                    >
                      ¥{p.amount.toFixed(2)}
                    </span>
                    {p.paid ? (
                      <span className="flex items-center gap-0.5 text-xs text-success-600 bg-success-50 px-2 py-1 rounded-full">
                        <UserCheck className="w-3 h-3" />
                        已付
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkPaid(p.roommateId)}
                        className="flex items-center gap-0.5 text-xs text-white bg-primary-500 hover:bg-primary-600 px-2.5 py-1 rounded-full transition-colors active:scale-95"
                      >
                        <UserX className="w-3 h-3" />
                        标记已付
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
              <span className="text-sm text-gray-600">分摊方式</span>
              <span className="text-sm font-medium text-gray-800">
                {bill.splitMode === 'equal' ? '🪄 平均分摊' : '✏️ 自定义金额'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
