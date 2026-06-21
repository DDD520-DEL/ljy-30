import { useBorrowStore } from '@/store/useBorrowStore';
import type { BorrowRecord } from '@/types';
import { Users, UserPlus, X, Bell, Check, Clock, Ban } from 'lucide-react';

interface ReservationQueueSectionProps {
  record: BorrowRecord;
}

export function ReservationQueueSection({ record }: ReservationQueueSectionProps) {
  const {
    getReservationsByRecordId,
    getReservationByRecordAndRoommate,
    getReservationCountByRecordId,
    addReservation,
    cancelReservation,
    roommates,
    currentHouseId,
  } = useBorrowStore();

  const isReturned = record.status === 'returned';
  const currentRoommates = roommates.filter((r) => r.houseId === currentHouseId);
  const allReservations = getReservationsByRecordId(record.id);
  const queueCount = getReservationCountByRecordId(record.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3" />
            排队中
          </span>
        );
      case 'notified':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 animate-pulse">
            <Bell className="w-3 h-3" />
            已通知
          </span>
        );
      case 'fulfilled':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-success-100 text-success-700">
            <Check className="w-3 h-3" />
            已借用
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            <Ban className="w-3 h-3" />
            已取消
          </span>
        );
      default:
        return null;
    }
  };

  const handleJoinQueue = (roommateId: string) => {
    const roommate = currentRoommates.find((r) => r.id === roommateId);
    if (!roommate) return;
    addReservation(record.id, roommate.id, roommate.name, roommate.avatar);
  };

  const handleCancelReservation = (entryId: string) => {
    cancelReservation(entryId);
  };

  if (isReturned && allReservations.length === 0) return null;

  return (
    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-indigo-700">预约队列</span>
          {queueCount > 0 && (
            <span className="text-xs px-2 py-0.5 bg-indigo-500 text-white rounded-full">
              {queueCount} 人排队
            </span>
          )}
        </div>
        {!isReturned && (
          <div className="relative group">
            <button className="flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all active:scale-95">
              <UserPlus className="w-3 h-3" />
              加入排队
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-2 w-48 z-10 hidden group-hover:block max-h-60 overflow-y-auto">
              {currentRoommates
                .filter((r) => r.id !== record.roommateId)
                .filter((r) => {
                  const existing = getReservationByRecordAndRoommate(record.id, r.id);
                  return !existing;
                })
                .map((roommate) => (
                  <button
                    key={roommate.id}
                    onClick={() => handleJoinQueue(roommate.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <span className="text-lg">{roommate.avatar}</span>
                    <span className="text-sm text-gray-700">{roommate.name}</span>
                  </button>
                ))}
              {currentRoommates.filter((r) => r.id !== record.roommateId).length === 0 && (
                <p className="text-xs text-gray-400 px-3 py-2 text-center">暂无其他室友</p>
              )}
            </div>
          </div>
        )}
      </div>

      {allReservations.length === 0 ? (
        <p className="text-xs text-indigo-400 text-center py-3">
          暂无人排队，物品归还后可通知预约者
        </p>
      ) : (
        <div className="space-y-2">
          {allReservations.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-indigo-100"
            >
              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                {entry.status === 'waiting' ? entry.position : '#'}
              </div>
              <span className="text-lg">{entry.roommateAvatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{entry.roommateName}</p>
                <p className="text-xs text-gray-400">
                  {new Date(entry.createdAt).toLocaleDateString('zh-CN', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {entry.notifiedAt && (
                    <span className="text-amber-500 ml-1">
                      · 通知于 {new Date(entry.notifiedAt).toLocaleDateString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {getStatusBadge(entry.status)}
                {entry.status === 'waiting' && (
                  <button
                    onClick={() => handleCancelReservation(entry.id)}
                    className="p-1 hover:bg-red-50 rounded-full transition-colors"
                    title="取消排队"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
