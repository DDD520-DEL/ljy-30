import { useState, useEffect } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { COMMON_ITEMS, RETURN_TIME_OPTIONS } from '@/data/constants';
import type { BorrowType, ItemOption } from '@/types';
import { X, Plus, ChevronDown } from 'lucide-react';
import { addDays, formatDate } from '@/utils/date';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRecordModal({ isOpen, onClose }: AddRecordModalProps) {
  const { addRecord, roommates } = useBorrowStore();
  const [type, setType] = useState<BorrowType>('lend');
  const [itemName, setItemName] = useState('');
  const [itemEmoji, setItemEmoji] = useState('📦');
  const [roommateId, setRoommateId] = useState('');
  const [returnDays, setReturnDays] = useState(3);
  const [customDate, setCustomDate] = useState('');
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [note, setNote] = useState('');
  const [showItems, setShowItems] = useState(false);
  const [showRoommates, setShowRoommates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setType('lend');
      setItemName('');
      setItemEmoji('📦');
      setRoommateId(roommates[0]?.id || '');
      setReturnDays(3);
      setCustomDate('');
      setUseCustomDate(false);
      setNote('');
    }
  }, [isOpen, roommates]);

  const handleSelectItem = (item: ItemOption) => {
    setItemName(item.name);
    setItemEmoji(item.emoji);
    setShowItems(false);
  };

  const handleSubmit = () => {
    if (!itemName.trim() || !roommateId) return;

    const roommate = roommates.find((r) => r.id === roommateId);
    if (!roommate) return;

    const expectedReturnDate = useCustomDate
      ? new Date(customDate).toISOString()
      : addDays(new Date(), returnDays).toISOString();

    addRecord({
      type,
      itemName: itemName.trim(),
      itemEmoji,
      roommateId,
      roommateName: roommate.name,
      roommateAvatar: roommate.avatar,
      borrowDate: new Date().toISOString(),
      expectedReturnDate,
      note: note.trim() || undefined,
    });

    onClose();
  };

  const selectedRoommate = roommates.find((r) => r.id === roommateId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">➕</span>
            添加记录
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-6">
          <button
            onClick={() => setType('lend')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
              type === 'lend'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-gray-500'
            }`}
          >
            📤 我借出
          </button>
          <button
            onClick={() => setType('borrow')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
              type === 'borrow'
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-gray-500'
            }`}
          >
            📥 我借入
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              物品名称
            </label>
            <div className="relative">
              <div className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl focus-within:border-primary-400 transition-colors">
                <span className="text-2xl">{itemEmoji}</span>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  onFocus={() => setShowItems(true)}
                  placeholder="输入物品名称"
                  className="flex-1 outline-none text-gray-800 placeholder-gray-400"
                />
              </div>

              {showItems && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  <div className="p-2 grid grid-cols-4 gap-1">
                    {COMMON_ITEMS.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleSelectItem(item)}
                        className="flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <span className="text-2xl">{item.emoji}</span>
                        <span className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'lend' ? '借给谁' : '向谁借'}
            </label>
            <div className="relative">
              <button
                onClick={() => setShowRoommates(!showRoommates)}
                className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                {selectedRoommate ? (
                  <>
                    <span className="text-2xl">{selectedRoommate.avatar}</span>
                    <span className="text-gray-800">{selectedRoommate.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400">请选择室友</span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
              </button>

              {showRoommates && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {roommates.map((roommate) => (
                    <button
                      key={roommate.id}
                      onClick={() => {
                        setRoommateId(roommate.id);
                        setShowRoommates(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                        roommateId === roommate.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <span className="text-2xl">{roommate.avatar}</span>
                      <span className="text-gray-800">{roommate.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预期归还时间
            </label>
            {!useCustomDate ? (
              <div className="grid grid-cols-3 gap-2">
                {RETURN_TIME_OPTIONS.map((option) => (
                  <button
                    key={option.days}
                    onClick={() => setReturnDays(option.days)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      returnDays === option.days
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors"
              />
            )}
            <button
              onClick={() => setUseCustomDate(!useCustomDate)}
              className="mt-2 text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              {useCustomDate ? '📅 使用快捷选项' : '✨ 自定义日期'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注 <span className="text-gray-400">(选填)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="比如：记得洗完澡还我哦~"
              rows={2}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors resize-none text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!itemName.trim() || !roommateId}
          className="w-full mt-6 py-4 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          添加记录
        </button>
      </div>
    </div>
  );
}
