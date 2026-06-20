import { useState, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { ROOMMATE_AVATARS, ROOMMATE_COLORS } from '@/data/constants';
import { X, Plus, Trash2 } from 'lucide-react';

interface RoommateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoommateModal({ isOpen, onClose }: RoommateModalProps) {
  const { roommates, currentHouseId, addRoommate, deleteRoommate, getCurrentHouse } = useBorrowStore();
  const currentHouse = getCurrentHouse();

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(ROOMMATE_AVATARS[0]);
  const [selectedColor, setSelectedColor] = useState(ROOMMATE_COLORS[0]);

  const handleAddRoommate = () => {
    if (!newName.trim()) return;
    addRoommate({
      name: newName.trim(),
      avatar: selectedAvatar,
      color: selectedColor,
    });
    setNewName('');
    setSelectedAvatar(ROOMMATE_AVATARS[Math.floor(Math.random() * ROOMMATE_AVATARS.length)]);
    setSelectedColor(ROOMMATE_COLORS[Math.floor(Math.random() * ROOMMATE_COLORS.length)]);
    setShowAddForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定要删除室友"${name}"吗？相关的借还记录不会被删除。`)) {
      deleteRoommate(id);
    }
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
            <span className="text-2xl">👥</span>
            室友管理
            {currentHouse && (
              <span className="text-sm font-normal text-gray-500">
                · {currentHouse.emoji} {currentHouse.name}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {currentRoommates.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-5xl mb-3 block">🏠</span>
              <p className="text-gray-500 text-sm">还没有添加室友哦~</p>
            </div>
          ) : (
            currentRoommates.map((roommate) => (
              <div
                key={roommate.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: roommate.color + '20' }}
                >
                  {roommate.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{roommate.name}</p>
                  <p className="text-xs text-gray-500">一起合租的好伙伴~</p>
                </div>
                <button
                  onClick={() => handleDelete(roommate.id, roommate.name)}
                  className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {showAddForm ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-2xl">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加新室友
            </h3>

            <div>
              <label className="block text-sm text-gray-600 mb-2">选择头像</label>
              <div className="grid grid-cols-8 gap-2">
                {ROOMMATE_AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`p-2 rounded-lg text-xl transition-all ${
                      selectedAvatar === avatar
                        ? 'bg-primary-100 ring-2 ring-primary-400 scale-110'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">选择主题色</label>
              <div className="flex gap-2 flex-wrap">
                {ROOMMATE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">室友名字</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="输入室友的名字~"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleAddRoommate()}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddRoommate}
                disabled={!newName.trim()}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-primary-400 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加新室友
          </button>
        )}
      </div>
    </div>
  );
}
