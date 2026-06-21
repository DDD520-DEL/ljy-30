import type { ExpressRecord } from '@/types';
import { Package, MapPin, User, Clock, CheckCircle } from 'lucide-react';

interface ExpressCardProps {
  record: ExpressRecord;
  onClick?: () => void;
}

export function ExpressCard({ record, onClick }: ExpressCardProps) {
  const isPending = record.status === 'pending';

  const getBorderColor = () => {
    if (isPending) return 'border-primary-300';
    return 'border-gray-200';
  };

  const getLeftBarColor = () => {
    if (isPending) return 'bg-primary-400';
    return 'bg-gray-300';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const maskTrackingNumber = (tracking: string) => {
    if (tracking.length <= 8) return tracking;
    return tracking.slice(0, 4) + '****' + tracking.slice(-4);
  };

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-4 shadow-sm border-l-4 ${getBorderColor()} ${getLeftBarColor()} 
        hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden
        ${!isPending ? 'opacity-60' : ''}
        animate-slide-up`}
    >
      {isPending ? (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-primary-500 text-white text-xs font-medium rounded-full shadow-md">
          <Clock className="w-3 h-3" />
          <span>待取件</span>
        </div>
      ) : (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-success-500 text-white text-xs font-medium rounded-full shadow-md">
          <CheckCircle className="w-3 h-3" />
          <span>已签收</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="text-4xl flex-shrink-0">📦</div>
        <div className="flex-1 min-w-0 pr-16">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold text-gray-800 ${!isPending ? 'line-through text-gray-500' : ''}`}>
              {maskTrackingNumber(record.trackingNumber)}
            </h3>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-3.5 h-3.5 text-primary-500" />
              <span>收件人：{record.recipientName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-warning-500" />
              <span>存放位置：{record.storageLocation}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-3.5 h-3.5 text-info-500" />
              <span>代收人：{record.courierName}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <span>
                {isPending ? `登记于 ${formatDate(record.createdAt)}` : `签收于 ${formatDate(record.pickedAt || '')}`}
              </span>
            </div>
          </div>

          {record.note && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-500">
              <span className="font-medium text-gray-600">备注：</span>
              {record.note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
