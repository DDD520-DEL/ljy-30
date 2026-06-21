import { X, Package, MapPin, User, Clock, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import { useBorrowStore } from '@/store/useBorrowStore';
import type { ExpressStatus } from '@/types';

interface ExpressDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpressDetailModal({ isOpen, onClose }: ExpressDetailModalProps) {
  const {
    selectedExpress,
    pickUpExpress,
    deleteExpressRecord,
    setShowExpressDetailModal,
    setSelectedExpress,
  } = useBorrowStore();

  if (!isOpen || !selectedExpress) return null;

  const record = selectedExpress;

  const getStatusConfig = (status: ExpressStatus) => {
    switch (status) {
      case 'pending':
        return { label: '待取件', color: 'text-primary-600', bgColor: 'bg-primary-100', borderColor: 'border-primary-200', icon: Clock };
      case 'picked':
        return { label: '已签收', color: 'text-success-600', bgColor: 'bg-success-100', borderColor: 'border-success-200', icon: CheckCircle };
      default:
        return { label: '未知', color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-200', icon: AlertCircle };
    }
  };

  const statusConfig = getStatusConfig(record.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePickUp = () => {
    if (window.confirm(`确定要签收这个快递吗？`)) {
      pickUpExpress(record.id);
    }
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这条快递记录吗？此操作不可撤销。')) {
      deleteExpressRecord(record.id);
      setSelectedExpress(null);
      setShowExpressDetailModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            📦
            快递详情
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${statusConfig.bgColor} rounded-2xl flex items-center justify-center text-3xl flex-shrink-0`}>
                📦
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">{record.trackingNumber}</h1>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <h3 className="text-sm font-medium text-gray-500 mb-3">快递信息</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">收件人</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{record.recipientAvatar}</span>
                        <span className="font-medium text-gray-800">{record.recipientName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-info-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">代收人</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{record.courierAvatar}</span>
                        <span className="font-medium text-gray-800">{record.courierName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-warning-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">存放位置</p>
                      <p className="font-medium text-gray-800">{record.storageLocation}</p>
                    </div>
                  </div>
                </div>
              </div>

              {record.note && (
                <div className="p-4 bg-warning-50 rounded-2xl">
                  <h3 className="text-sm font-medium text-warning-600 mb-2">备注</h3>
                  <p className="text-sm text-gray-700">{record.note}</p>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-2xl">
                <h3 className="text-sm font-medium text-gray-500 mb-3">时间记录</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">登记时间</p>
                      <p className="font-medium text-gray-800">{formatDate(record.createdAt)}</p>
                    </div>
                  </div>

                  {record.pickedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-success-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">签收时间</p>
                        <p className="font-medium text-gray-800">{formatDate(record.pickedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex-shrink-0 space-y-3">
          {record.status === 'pending' && (
            <button
              onClick={handlePickUp}
              className="w-full py-4 bg-gradient-to-r from-success-400 to-success-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              确认签收
            </button>
          )}

          <button
            onClick={handleDelete}
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            删除记录
          </button>
        </div>
      </div>
    </div>
  );
}
