import { useState, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { ChevronDown, ChevronUp, Package, X } from 'lucide-react';
import type { ExpressRecord } from '@/types';

interface ExpressReminderBannerProps {
  onItemClick: (record: ExpressRecord) => void;
}

export function ExpressReminderBanner({ onItemClick }: ExpressReminderBannerProps) {
  const { expressRecords, currentHouseId } = useBorrowStore();
  const pendingExpress = useMemo(() => {
    return expressRecords
      .filter((r) => r.houseId === currentHouseId && r.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [expressRecords, currentHouseId]);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (pendingExpress.length === 0 || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-400 text-white animate-fade-in">
      <div className="max-w-md mx-auto">
        <div
          className="flex items-center justify-between px-5 py-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Package className="w-5 h-5 shrink-0 animate-pulse-soft" />
            <span className="text-sm font-medium truncate">
              📦 取件提醒：有 {pendingExpress.length} 个快递待取
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
            {pendingExpress.map((record) => (
              <div
                key={record.id}
                onClick={() => onItemClick(record)}
                className="flex items-center gap-3 bg-white/20 backdrop-blur rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/30 transition-all active:scale-[0.98]"
              >
                <span className="text-2xl shrink-0">📦</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{record.trackingNumber}</p>
                  <p className="text-xs text-white/80 truncate">
                    {record.recipientName} · {record.storageLocation}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium bg-white/20">
                  待取
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
