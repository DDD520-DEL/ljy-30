import { useState, useMemo, useEffect } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { X, Plus, Trash2, Vote, Eye, EyeOff, ListChecks, CircleDot, Sparkles, Clock } from 'lucide-react';
import { POLL_EMOJIS, POLL_END_TIME_OPTIONS, POLL_PRESET_TOPICS } from '@/data/constants';
import type { PollOption, PollType, PollVisibility } from '@/types';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const generateOptionId = () => Math.random().toString(36).substr(2, 9);

export function CreatePollModal({ isOpen, onClose }: CreatePollModalProps) {
  const {
    roommates,
    currentHouseId,
    announcementRoommateId,
    setAnnouncementRoommateId,
    addPoll,
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
  const [selectedEmoji, setSelectedEmoji] = useState(POLL_EMOJIS[0]);
  const [type, setType] = useState<PollType>('single');
  const [visibility, setVisibility] = useState<PollVisibility>('public');
  const [options, setOptions] = useState<PollOption[]>([
    { id: generateOptionId(), text: '' },
    { id: generateOptionId(), text: '' },
  ]);
  const [endHours, setEndHours] = useState(POLL_END_TIME_OPTIONS[3].hours);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedEmoji(POLL_EMOJIS[0]);
    setType('single');
    setVisibility('public');
    setOptions([
      { id: generateOptionId(), text: '' },
      { id: generateOptionId(), text: '' },
    ]);
    setEndHours(POLL_END_TIME_OPTIONS[3].hours);
  };

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions([...options, { id: generateOptionId(), text: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter((o) => o.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const applyPreset = (preset: typeof POLL_PRESET_TOPICS[number]) => {
    setTitle(preset.title);
    setSelectedEmoji(preset.emoji);
    setOptions(preset.options.map((text) => ({ id: generateOptionId(), text })));
  };

  const canSubmit = useMemo(() => {
    const validOptions = options.filter((o) => o.text.trim().length > 0);
    return title.trim().length > 0 && validOptions.length >= 2 && resolvedRoommateId;
  }, [title, options, resolvedRoommateId]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const roommate = currentRoommates.find((r) => r.id === resolvedRoommateId);
    if (!roommate) return;

    const validOptions = options
      .filter((o) => o.text.trim().length > 0)
      .map((o) => ({ ...o, text: o.text.trim() }));

    const endAt = new Date(Date.now() + endHours * 60 * 60 * 1000).toISOString();

    addPoll({
      title: title.trim(),
      description: description.trim(),
      emoji: selectedEmoji,
      type,
      visibility,
      options: validOptions,
      creatorId: roommate.id,
      creatorName: roommate.name,
      creatorAvatar: roommate.avatar,
      endAt,
    });

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5 sticky top-0 bg-white -mx-6 px-6 py-2 -mt-6 z-10 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Vote className="w-6 h-6 text-info-500" />
            发起投票
          </h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {POLL_PRESET_TOPICS.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-warning-500" />
              <label className="text-sm text-gray-600 font-medium">快速开始</label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {POLL_PRESET_TOPICS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-warning-50 text-warning-700 hover:bg-warning-100 transition-colors border border-warning-100"
                >
                  <span>{preset.emoji}</span>
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentRoommates.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2 font-medium">发起身份</label>
            <div className="flex gap-2 flex-wrap">
              {currentRoommates.map((roommate) => (
                <button
                  key={roommate.id}
                  onClick={() => setAnnouncementRoommateId(roommate.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                    resolvedRoommateId === roommate.id
                      ? 'bg-info-100 text-info-700 ring-2 ring-info-400'
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

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-600 mb-2 font-medium">选择图标</label>
            <div className="grid grid-cols-8 gap-1.5 max-h-28 overflow-y-auto p-2 bg-gray-50 rounded-xl">
              {POLL_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`p-1.5 rounded-lg text-xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-info-100 ring-2 ring-info-400 scale-110'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2 font-medium">投票标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：要不要养猫？"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-info-400 outline-none transition-colors"
              maxLength={40}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/40</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2 font-medium">补充说明（选填）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="可以补充一些投票背景、注意事项等..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-info-400 outline-none transition-colors resize-none"
              rows={2}
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/200</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-2 font-medium">投票类型</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setType('single')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    type === 'single'
                      ? 'bg-info-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <CircleDot className="w-4 h-4" />
                  单选
                </button>
                <button
                  onClick={() => setType('multiple')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    type === 'multiple'
                      ? 'bg-info-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ListChecks className="w-4 h-4" />
                  多选
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2 font-medium">投票可见性</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setVisibility('public')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    visibility === 'public'
                      ? 'bg-success-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  实名
                </button>
                <button
                  onClick={() => setVisibility('anonymous')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    visibility === 'anonymous'
                      ? 'bg-success-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <EyeOff className="w-4 h-4" />
                  匿名
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-600 font-medium">投票选项（至少2个）</label>
              <span className="text-xs text-gray-400">{options.length}/10</span>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    placeholder={`选项 ${index + 1}`}
                    className="flex-1 p-2.5 border-2 border-gray-200 rounded-xl focus:border-info-400 outline-none transition-colors text-sm"
                    maxLength={30}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(option.id)}
                      className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-xl transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button
                onClick={addOption}
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-info-600 bg-info-50 hover:bg-info-100 transition-colors border-2 border-dashed border-info-200"
              >
                <Plus className="w-4 h-4" />
                添加选项
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <label className="text-sm text-gray-600 font-medium">截止时间</label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {POLL_END_TIME_OPTIONS.map((option) => (
                <button
                  key={option.hours}
                  onClick={() => setEndHours(option.hours)}
                  className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                    endHours === option.hours
                      ? 'bg-danger-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 sticky bottom-0 bg-white -mx-6 px-6 py-3 border-t border-gray-50 -mb-6">
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 py-3 bg-info-500 text-white rounded-xl font-medium hover:bg-info-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              发起投票
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
