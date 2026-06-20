import { useState } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import type { House } from '@/types';
import { X, Plus, Check, Trash2, Home, Copy, CheckCheck, LogIn } from 'lucide-react';

interface HouseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'list' | 'create' | 'join';

const HOUSE_EMOJI_OPTIONS = ['🏠', '🏡', '🏘️', '🏢', '🏬', '🏚️', '🏛️', '🏗️', '🏰', '🏯', '🏟️', '🌆', '🌃', '🌇', '🌉', '🏖️'];

export function HouseModal({ isOpen, onClose }: HouseModalProps) {
  const {
    houses,
    currentHouseId,
    switchHouse,
    createHouse,
    joinHouse,
    deleteHouse,
  } = useBorrowStore();

  const [tab, setTab] = useState<TabType>('list');
  const [newHouseName, setNewHouseName] = useState('');
  const [newHouseEmoji, setNewHouseEmoji] = useState('🏠');
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const resetForm = () => {
    setNewHouseName('');
    setNewHouseEmoji('🏠');
    setInviteCode('');
    setJoinError('');
    setCopiedCode(null);
  };

  const handleClose = () => {
    resetForm();
    setTab('list');
    onClose();
  };

  const handleCreate = () => {
    if (!newHouseName.trim()) return;
    createHouse({
      name: newHouseName.trim(),
      emoji: newHouseEmoji,
    });
    resetForm();
    setTab('list');
  };

  const handleJoin = () => {
    const result = joinHouse(inviteCode);
    if (result) {
      resetForm();
      setTab('list');
    } else {
      setJoinError('邀请码无效，请检查后重试');
    }
  };

  const handleCopyInviteCode = (house: House) => {
    navigator.clipboard?.writeText(house.inviteCode);
    setCopiedCode(house.id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = (house: House) => {
    if (houses.length <= 1) {
      alert('至少需要保留一个房屋');
      return;
    }
    if (window.confirm(`确定要删除房屋"${house.name}"吗？该房屋下的所有室友、借还记录和库存数据都将被删除。`)) {
      deleteHouse(house.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🏘️</span>
            房屋管理
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {tab === 'list' && (
          <>
            <div className="space-y-3 mb-6">
              {houses.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-5xl mb-3 block">🏠</span>
                  <p className="text-gray-500 text-sm">还没有房屋，快去创建一个吧~</p>
                </div>
              ) : (
                houses.map((house) => (
                  <div
                    key={house.id}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      house.id === currentHouseId
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">
                      {house.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800 truncate">{house.name}</p>
                        {house.id === currentHouseId && (
                          <span className="text-xs px-2 py-0.5 bg-primary-500 text-white rounded-full">
                            当前
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-gray-400">邀请码:</span>
                        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          {house.inviteCode}
                        </span>
                        <button
                          onClick={() => handleCopyInviteCode(house)}
                          className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                          title="复制邀请码"
                        >
                          {copiedCode === house.id ? (
                            <CheckCheck className="w-3.5 h-3.5 text-success-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {house.id !== currentHouseId && (
                        <button
                          onClick={() => switchHouse(house.id)}
                          className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
                          title="切换到此房屋"
                        >
                          <Home className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(house)}
                        className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-full transition-colors"
                        title="删除房屋"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  resetForm();
                  setTab('create');
                }}
                className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-primary-300 text-primary-600 rounded-2xl hover:bg-primary-50 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                创建房屋
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setTab('join');
                }}
                className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-purple-300 text-purple-600 rounded-2xl hover:bg-purple-50 transition-colors font-medium"
              >
                <LogIn className="w-5 h-5" />
                加入房屋
              </button>
            </div>
          </>
        )}

        {tab === 'create' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择图标
              </label>
              <div className="grid grid-cols-8 gap-2">
                {HOUSE_EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNewHouseEmoji(emoji)}
                    className={`p-2 rounded-xl text-2xl transition-all ${
                      newHouseEmoji === emoji
                        ? 'bg-primary-100 ring-2 ring-primary-400 scale-110'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                房屋名称
              </label>
              <input
                type="text"
                value={newHouseName}
                onChange={(e) => setNewHouseName(e.target.value)}
                placeholder="比如：阳光公寓、温馨小窝"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  resetForm();
                  setTab('list');
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!newHouseName.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                创建
              </button>
            </div>
          </div>
        )}

        {tab === 'join' && (
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="text-5xl mb-3">🔑</div>
              <p className="text-gray-600 text-sm">输入室友分享给你的邀请码加入房屋</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邀请码
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase());
                  setJoinError('');
                }}
                placeholder="输入6位邀请码"
                maxLength={6}
                className={`w-full p-4 border-2 rounded-xl focus:border-purple-400 outline-none transition-colors text-center text-2xl font-mono tracking-widest uppercase ${
                  joinError ? 'border-danger-400 bg-danger-50' : 'border-gray-200'
                }`}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              {joinError && (
                <p className="text-danger-500 text-xs mt-2 text-center">{joinError}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  resetForm();
                  setTab('list');
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleJoin}
                disabled={inviteCode.trim().length < 4}
                className="flex-1 py-3 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                加入
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
