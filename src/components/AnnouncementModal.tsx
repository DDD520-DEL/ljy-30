import { useState, useMemo, useEffect } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { X, Megaphone, Trash2, Check, Plus } from 'lucide-react';

const ANNOUNCEMENT_EMOJIS = ['📢', '🎉', '🧹', '🛒', '🍽️', '🔧', '💡', '📦', '🎊', '⚠️', '🌟', '📅'];

const EXPIRY_OPTIONS = [
  { label: '不过期', days: 0 },
  { label: '1天后', days: 1 },
  { label: '3天后', days: 3 },
  { label: '7天后', days: 7 },
];

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnnouncementModal({ isOpen, onClose }: AnnouncementModalProps) {
  const {
    roommates,
    currentHouseId,
    announcementRoommateId,
    setAnnouncementRoommateId,
    addAnnouncement,
    deleteAnnouncement,
    getAnnouncements,
    markAnnouncementRead,
  } = useBorrowStore();

  const announcements = getAnnouncements();

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

  const [showAddForm, setShowAddForm] = useState(false);
  const [content, setContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(ANNOUNCEMENT_EMOJIS[0]);
  const [expiryDays, setExpiryDays] = useState(1);

  const handleAddAnnouncement = () => {
    if (!content.trim() || !resolvedRoommateId) return;
    const roommate = currentRoommates.find((r) => r.id === resolvedRoommateId);
    if (!roommate) return;

    const expiresAt = expiryDays > 0
      ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    addAnnouncement({
      content: content.trim(),
      roommateId: roommate.id,
      roommateName: roommate.name,
      roommateAvatar: roommate.avatar,
      emoji: selectedEmoji,
      expiresAt,
    });

    setContent('');
    setSelectedEmoji(ANNOUNCEMENT_EMOJIS[0]);
    setExpiryDays(1);
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条公告吗？')) {
      deleteAnnouncement(id);
    }
  };

  const handleMarkRead = (id: string) => {
    if (resolvedRoommateId) {
      markAnnouncementRead(id, resolvedRoommateId);
    }
  };

  const formatDate = (dateStr: string) => {
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

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isReadByCurrent = (readBy: string[]) => {
    return resolvedRoommateId && readBy.includes(resolvedRoommateId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary-500" />
            公告板
          </h2>
          <button
            onClick={onClose}
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
                      ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-400'
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

        <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto pr-1">
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl mb-3 block">📭</span>
              <p className="text-gray-500 text-sm">还没有公告，点击下方按钮发布第一条吧~</p>
            </div>
          ) : (
            announcements.map((announcement) => {
              const expired = isExpired(announcement.expiresAt);
              const isRead = isReadByCurrent(announcement.readBy);
              return (
                <div
                  key={announcement.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    expired
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : isRead
                      ? 'bg-gray-50 border-gray-100'
                      : 'bg-primary-50 border-primary-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0">{announcement.emoji || '📢'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800 flex items-center gap-1">
                          <span>{announcement.roommateAvatar}</span>
                          {announcement.roommateName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(announcement.createdAt)}
                        </span>
                        {!isRead && !expired && (
                          <span className="text-xs px-2 py-0.5 bg-danger-500 text-white rounded-full font-medium">
                            新
                          </span>
                        )}
                        {expired && (
                          <span className="text-xs px-2 py-0.5 bg-gray-400 text-white rounded-full">
                            已过期
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {announcement.content}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Check className="w-3 h-3" />
                          <span>{announcement.readBy.length} 人已读</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {!isRead && !expired && resolvedRoommateId && (
                            <button
                              onClick={() => handleMarkRead(announcement.id)}
                              className="text-xs px-2.5 py-1 bg-success-100 text-success-700 rounded-lg hover:bg-success-200 transition-colors font-medium"
                            >
                              标记已读
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(announcement.id)}
                            className="p-1.5 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showAddForm ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-2xl">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              发布新公告
            </h3>

            <div>
              <label className="block text-sm text-gray-600 mb-2">选择图标</label>
              <div className="grid grid-cols-6 gap-2">
                {ANNOUNCEMENT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`p-2 rounded-lg text-2xl transition-all ${
                      selectedEmoji === emoji
                        ? 'bg-primary-100 ring-2 ring-primary-400 scale-110'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">发布人</label>
              <div className="flex gap-2 flex-wrap">
                {currentRoommates.map((roommate) => (
                  <button
                    key={roommate.id}
                    onClick={() => setAnnouncementRoommateId(roommate.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                      resolvedRoommateId === roommate.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span>{roommate.avatar}</span>
                    <span>{roommate.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">公告内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="例如：今晚有朋友来访、周末大扫除...  "
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{content.length}/200</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">过期时间</label>
              <div className="flex gap-2 flex-wrap">
                {EXPIRY_OPTIONS.map((option) => (
                  <button
                    key={option.days}
                    onClick={() => setExpiryDays(option.days)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      expiryDays === option.days
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddAnnouncement}
                disabled={!content.trim() || !resolvedRoommateId}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发布
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={currentRoommates.length === 0}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-primary-400 hover:text-primary-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            {currentRoommates.length === 0 ? '请先添加室友' : '发布新公告'}
          </button>
        )}
      </div>
    </div>
  );
}
