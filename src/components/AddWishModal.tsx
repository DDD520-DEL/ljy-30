import { useState, useMemo, useEffect } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { X, Plus, Sparkles } from 'lucide-react';
import { WISH_EMOJIS, WISH_RETURN_OPTIONS } from '@/data/constants';

interface AddWishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddWishModal({ isOpen, onClose }: AddWishModalProps) {
  const {
    roommates,
    currentHouseId,
    announcementRoommateId,
    setAnnouncementRoommateId,
    addWish,
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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(WISH_EMOJIS[0]);
  const [expectedReturnDays, setExpectedReturnDays] = useState(1);

  const handleSubmit = () => {
    if (!title.trim() || !resolvedRoommateId) return;
    const roommate = currentRoommates.find((r) => r.id === resolvedRoommateId);
    if (!roommate) return;

    addWish({
      title: title.trim(),
      description: description.trim(),
      emoji: selectedEmoji,
      requesterId: roommate.id,
      requesterName: roommate.name,
      requesterAvatar: roommate.avatar,
      expectedReturnDays,
    });

    setTitle('');
    setDescription('');
    setSelectedEmoji(WISH_EMOJIS[0]);
    setExpectedReturnDays(1);
    onClose();
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
            <Sparkles className="w-6 h-6 text-warning-500" />
            发布心愿
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
            <label className="block text-sm text-gray-600 mb-2">发布身份</label>
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
          <div>
            <label className="block text-sm text-gray-600 mb-2">选择图标</label>
            <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-xl">
              {WISH_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`p-2 rounded-lg text-2xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-warning-100 ring-2 ring-warning-400 scale-110'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">心愿标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：想借一个打气筒"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-warning-400 outline-none transition-colors"
              maxLength={30}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/30</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">详细描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述一下你需要借什么，为什么需要，什么时候归还..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-warning-400 outline-none transition-colors resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/200</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">预计归还时间</label>
            <div className="flex gap-2 flex-wrap">
              {WISH_RETURN_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  onClick={() => setExpectedReturnDays(option.days)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    expectedReturnDays === option.days
                      ? 'bg-warning-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !resolvedRoommateId}
              className="flex-1 py-3 bg-warning-500 text-white rounded-xl font-medium hover:bg-warning-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              发布心愿
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
