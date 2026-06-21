import type { MaintenanceRecord } from '@/types';
import { Clock, Wrench, CheckCircle, AlertCircle, DollarSign, User } from 'lucide-react';
import { useBorrowStore } from '@/store/useBorrowStore';

interface MaintenanceCardProps {
  record: MaintenanceRecord;
  onClick?: () => void;
}

export function MaintenanceCard({ record, onClick }: MaintenanceCardProps) {
  const { getMaintenanceStats } = useBorrowStore();

  const getStatusConfig = () => {
    switch (record.status) {
      case 'pending':
        return {
          label: '待处理',
          color: 'text-warning-600',
          bgColor: 'bg-warning-100',
          borderColor: 'border-warning-300',
          leftBarColor: 'bg-warning-400',
          icon: Clock,
        };
      case 'repairing':
        return {
          label: '维修中',
          color: 'text-info-600',
          bgColor: 'bg-info-100',
          borderColor: 'border-info-300',
          leftBarColor: 'bg-info-400',
          icon: Wrench,
        };
      case 'completed':
        return {
          label: '已修好',
          color: 'text-success-600',
          bgColor: 'bg-success-100',
          borderColor: 'border-success-300',
          leftBarColor: 'bg-success-400',
          icon: CheckCircle,
        };
      default:
        return {
          label: '未知',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          leftBarColor: 'bg-gray-400',
          icon: AlertCircle,
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-4 shadow-sm border-l-4 ${config.borderColor} ${config.leftBarColor}
        hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden
        ${record.status === 'completed' ? 'opacity-90' : ''}
        animate-slide-up`}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl flex-shrink-0">{record.itemEmoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold text-gray-800 truncate ${record.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
              {record.itemName}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 flex items-center gap-1 ${config.bgColor} ${config.color} ${config.borderColor}`}>
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {record.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span className="text-base">{record.reporterAvatar}</span>
            <span>{record.reporterName} 报修</span>
            <span className="text-gray-400">·</span>
            <span>{formatDate(record.reportedAt)}</span>
          </div>

          {record.repairerName && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <User className="w-3 h-3" />
              <span>维修人: {record.repairerAvatar} {record.repairerName}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            {record.status === 'completed' && record.cost !== undefined ? (
              <span className="text-xs px-2.5 py-1 rounded-full border bg-success-50 text-success-600 border-success-200 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                费用 ¥{record.cost}
              </span>
            ) : record.status === 'repairing' ? (
              <span className="text-xs px-2.5 py-1 rounded-full border bg-info-50 text-info-600 border-info-200 flex items-center gap-1">
                <Wrench className="w-3 h-3" />
                开始于 {formatDate(record.startedAt!)}
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full border bg-warning-50 text-warning-600 border-warning-200 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                等待处理
              </span>
            )}

            {record.status === 'completed' && record.completedAt && (
              <span className="text-xs text-gray-400">
                完成于 {formatDate(record.completedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {record.repairNote && record.status === 'completed' && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-start gap-1">
          <span>📝</span>
          <span className="line-clamp-2">{record.repairNote}</span>
        </div>
      )}
    </div>
  );
}
