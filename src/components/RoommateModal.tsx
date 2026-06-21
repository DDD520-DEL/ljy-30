import { useState, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { ROOMMATE_AVATARS, ROOMMATE_COLORS } from '@/data/constants';
import { X, Plus, Trash2, Edit2, Cake, Home as HomeIcon, Check } from 'lucide-react';
import { formatDateShort, getAge, getYearsSinceMoveIn } from '@/utils/date';

interface RoommateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoommateModal({ isOpen, onClose }: RoommateModalProps) {
  const { roommates, currentHouseId, addRoommate, deleteRoommate, updateRoommate, getCurrentHouse } = useBorrowStore();
  const currentHouse = getCurrentHouse();

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoommateId, setEditingRoommateId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(ROOMMATE_AVATARS[0]);
  const [selectedColor, setSelectedColor] = useState(ROOMMATE_COLORS[0]);
  const [birthday, setBirthday] = useState('');
  const [moveInDate, setMoveInDate] = useState('');

  const resetForm = () => {
    setNewName('');
    setSelectedAvatar(ROOMMATE_AVATARS[Math.floor(Math.random() * ROOMMATE_AVATARS.length)]);
    setSelectedColor(ROOMMATE_COLORS[Math.floor(Math.random() * ROOMMATE_COLORS.length)]);
    setBirthday('');
    setMoveInDate('');
    setEditingRoommateId(null);
  };

  const handleAddRoommate = () => {
    if (!newName.trim()) return;
    addRoommate({
      name: newName.trim(),
      avatar: selectedAvatar,
      color: selectedColor,
      birthday: birthday || undefined,
      moveInDate: moveInDate || undefined,
    });
    resetForm();
    setShowAddForm(false);
  };

  const handleEditRoommate = (id: string) => {
    const roommate = roommates.find((r) => r.id === id);
    if (!roommate) return;
    setNewName(roommate.name);
    setSelectedAvatar(roommate.avatar);
    setSelectedColor(roommate.color);
    setBirthday(roommate.birthday || '');
    setMoveInDate(roommate.moveInDate || '');
    setEditingRoommateId(id);
    setShowAddForm(true);
  };

  const handleSaveEdit = () => {
    if (!editingRoommateId || !newName.trim()) return;
    updateRoommate(editingRoommateId, {
      name: newName.trim(),
      avatar: selectedAvatar,
      color: selectedColor,
      birthday: birthday || undefined,
      moveInDate: moveInDate || undefined,
    });
    resetForm();
    setShowAddForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定要删除室友"${name}"吗？相关的借还记录不会被删除。`)) {
      deleteRoommate(id);
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowAddForm(false);
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
                className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: roommate.color + '20' }}
                  >
                    {roommate.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{roommate.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {roommate.birthday && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-pink-50 px-2 py-0.5 rounded-full">
                          <Cake className="w-3 h-3 text-pink-400" />
                          {formatDateShort(roommate.birthday)}
                          <span className="text-pink-500 font-medium">
                            ({getAge(roommate.birthday)}岁)
                          </span>
                        </span>
                      )}
                      {roommate.moveInDate && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-blue-50 px-2 py-0.5 rounded-full">
                          <HomeIcon className="w-3 h-3 text-blue-400" />
                          入住 {formatDateShort(roommate.moveInDate)}
                          <span className="text-blue-500 font-medium">
                            ({getYearsSinceMoveIn(roommate.moveInDate)}年)
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditRoommate(roommate.id)}
                      className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(roommate.id, roommate.name)}
                      className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-full transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showAddForm ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-2xl">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              {editingRoommateId ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  编辑室友信息
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  添加新室友
                </>
              )}
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
                onKeyDown={(e) => e.key === 'Enter' && (editingRoommateId ? handleSaveEdit() : handleAddRoommate())}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                <Cake className="w-4 h-4 text-pink-500" />
                生日 (选填)
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                <HomeIcon className="w-4 h-4 text-blue-500" />
                入住日期 (选填)
              </label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={editingRoommateId ? handleSaveEdit : handleAddRoommate}
                disabled={!newName.trim()}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {editingRoommateId ? (
                  <>
                    <Check className="w-4 h-4" />
                    保存
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    添加
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
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
