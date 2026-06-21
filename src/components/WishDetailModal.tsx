import { useState, useMemo, useEffect } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { X, Clock, User, CheckCircle, Archive, Gift, Trash2, Sparkles } from 'lucide-react';

interface WishDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishDetailModal({ isOpen, onClose }: WishDetailModalProps) {
  const {
    selectedWish,
    setSelectedWish,
    roommates,
    currentHouseId,
    announcementRoommateId,
    setAnnouncementRoommateId,
    lendWish,
    archiveWish,
    deleteWish,
  } = useBorrowStore();

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );

  const resolvedRoommateId = useMemo(() => {
    if (announcementRoommateId && currentRoommates.some((r) => r.id === announcementRoommateId)) {
      return announcementRoommateId;
    }
    return currentRoommates[0]?.id || '';
  }, [announcementRoommateId, currentRoommates]);

  useEffect(() => {
    if (!announcementRoommateId || !currentRoommates.some((r) => r.id === announcementRoommateId)) {
      if (currentRoommates.length > 0 && announcementRoommateId !== currentRoommates[0].id) {
        setAnnouncementRoommateId(currentRoommates[0].id);
      }
    }
  }, [currentRoommates, announcementRoommateId, setAnnouncementRoommateId]);

  const [lendNote, setLendNote] = useState('');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const handleLend = () => {
    if (!selectedWish || !resolvedRoommateId) return;
    const lender = currentRoommates.find((r) => r.id === resolvedRoommateId);
    if (!lender) return;
    if (lender.id === selectedWish.requesterId) {
      alert('不能借给自己哦~');
      return;
    }

    lendWish(
      selectedWish.id,
      lender.id,
      lender.name,
      lender.avatar,
      lendNote.trim() || undefined
    );
    setLendNote('');
  };

  const handleArchive = () => {
    if (!selectedWish) return;
    if (confirm('确定要将这个心愿归档吗？归档后将移至历史记录。')) {
      archiveWish(selectedWish.id);
    }
  };

  const handleDelete = () => {
    if (!selectedWish) return;
    if (confirm('确定要删除这个心愿吗？')) {
      deleteWish(selectedWish.id);
      onClose();
    }
  };

  const handleClose = () => {
    setLendNote('');
    setSelectedWish(null);
    onClose();
  };

  if (!isOpen || !selectedWish) return null;

  const isRequester = resolvedRoommateId === selectedWish.requesterId;
  const isLender = selectedWish.lenderId && resolvedRoommateId === selectedWish.lenderId;
  const canLend = selectedWish.status === 'active' && !isRequester;
  const canArchive = selectedWish.status === 'fulfilled' && isRequester;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-warning-500" />
            心愿详情
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {currentRoommates.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">当前身份</label>
            <div className="flex gap-2 flex-wrap">
              {currentRoommates.map((roommate) => (
                <button
                  key={roommate.id}
                  onClick={() => setAnnouncementRoommateId(roommate.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                    resolvedRoommateId === roommate.id
                      ? 'bg-warning-100 text-warning-700 ring-2 ring-warning-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{roommate.avatar}</span>
                  <span>{roommate.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border-2 ${
            selectedWish.status === 'active'
              ? 'bg-warning-50 border-warning-200'
              : selectedWish.status === 'fulfilled'
              ? 'bg-success-50 border-success-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="text-6xl shrink-0">{selectedWish.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{selectedWish.title}</h3>
                  {selectedWish.status === 'active' && (
                    <span className="text-xs px-2 py-0.5 bg-warning-500 text-white rounded-full font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      待借出
                    </span>
                  )}
                  {selectedWish.status === 'fulfilled' && (
                    <span className="text-xs px-2 py-0.5 bg-success-500 text-white rounded-full font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      已借出
                    </span>
                  )}
                  {selectedWish.status === 'archived' && (
                    <span className="text-xs px-2 py-0.5 bg-gray-500 text-white rounded-full font-medium flex items-center gap-1">
                      <Archive className="w-3 h-3" />
                      已归档
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedWish.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">请求者：</span>
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                    <span>{selectedWish.requesterAvatar}</span>
                    <span className="font-medium text-gray-700">{selectedWish.requesterName}</span>
                  </div>
                </div>
              </div>

              {selectedWish.lenderId && (
                <div className="flex items-center gap-3 text-sm">
                  <Gift className="w-4 h-4 text-success-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">借出者：</span>
                    <div className="flex items-center gap-1 bg-success-100 px-2 py-1 rounded-full">
                      <span>{selectedWish.lenderAvatar}</span>
                      <span className="font-medium text-success-700">{selectedWish.lenderName}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedWish.expectedReturnDays !== undefined && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">
                    预计归还：
                    <span className="font-medium text-gray-700">
                      {selectedWish.expectedReturnDays === 0 ? '用完即还' : `${selectedWish.expectedReturnDays}天内`}
                    </span>
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">
                  发布时间：
                  <span className="font-medium text-gray-700">{formatRelativeDate(selectedWish.createdAt)}</span>
                </span>
              </div>

              {selectedWish.fulfilledAt && (
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span className="text-gray-500">
                    借出时间：
                    <span className="font-medium text-success-700">{formatDate(selectedWish.fulfilledAt)}</span>
                  </span>
                </div>
              )}

              {selectedWish.archivedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Archive className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500">
                    归档时间：
                    <span className="font-medium text-gray-700">{formatDate(selectedWish.archivedAt)}</span>
                  </span>
                </div>
              )}

              {selectedWish.note && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">备注：</span>
                    {selectedWish.note}
                  </p>
                </div>
              )}
            </div>
          </div>

          {canLend && (
            <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                <Gift className="w-5 h-5 text-warning-500" />
                我可以借出
              </h4>
              <textarea
                value={lendNote}
                onChange={(e) => setLendNote(e.target.value)}
                placeholder="说点什么（可选），比如：我正好有一个闲置的可以借你~"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-warning-400 outline-none transition-colors resize-none bg-white"
                rows={2}
                maxLength={100}
              />
              <button
                onClick={handleLend}
                disabled={!resolvedRoommateId}
                className="w-full py-3 bg-warning-500 text-white rounded-xl font-medium hover:bg-warning-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                确认借出
              </button>
            </div>
          )}

          {canArchive && (
            <div className="p-4 bg-success-50 rounded-2xl">
              <p className="text-sm text-success-700 mb-3">
                🎉 太棒了！{selectedWish.lenderName} 已经把物品借给你了。确认收到后可以归档这条心愿。
              </p>
              <button
                onClick={handleArchive}
                className="w-full py-3 bg-success-500 text-white rounded-xl font-medium hover:bg-success-600 transition-colors flex items-center justify-center gap-2"
              >
                <Archive className="w-5 h-5" />
                确认收到并归档
              </button>
            </div>
          )}

          {isRequester && (
            <button
              onClick={handleDelete}
              className="w-full py-3 border-2 border-danger-200 text-danger-500 rounded-xl font-medium hover:bg-danger-50 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              删除心愿
            </button>
          )}

          {isLender && selectedWish.status === 'fulfilled' && (
            <div className="p-3 bg-warning-50 rounded-xl text-sm text-warning-700 text-center">
              你是借出者，请记得提醒 {selectedWish.requesterName} 按时归还哦~
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
