import { useState, useEffect } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { CHORE_TASK_OPTIONS } from '@/data/constants';
import { X, Plus, Sparkles } from 'lucide-react';
import type { ChoreTask } from '@/types';

interface ChoreTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: ChoreTask | null;
}

export function ChoreTaskModal({ isOpen, onClose, editingTask }: ChoreTaskModalProps) {
  const { addChoreTask, updateChoreTask, roommates, currentHouseId } = useBorrowStore();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🧹');
  const [description, setDescription] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setEmoji(editingTask.emoji);
      setDescription(editingTask.description || '');
      setShowSuggestions(false);
    } else {
      setName('');
      setEmoji('🧹');
      setDescription('');
      setShowSuggestions(true);
    }
  }, [editingTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingTask) {
      updateChoreTask(editingTask.id, {
        name: name.trim(),
        emoji,
        description: description.trim() || undefined,
      });
    } else {
      addChoreTask({
        name: name.trim(),
        emoji,
        description: description.trim() || undefined,
      });
    }
    onClose();
  };

  const handleSelectSuggestion = (suggestion: typeof CHORE_TASK_OPTIONS[0]) => {
    setName(suggestion.name);
    setEmoji(suggestion.emoji);
    setDescription(suggestion.description);
    setShowSuggestions(false);
  };

  const houseRoommates = roommates.filter((r) => r.houseId === currentHouseId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {editingTask ? '✏️ 编辑任务' : '➕ 添加家务任务'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {showSuggestions && !editingTask && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium text-gray-700">快速添加</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CHORE_TASK_OPTIONS.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => handleSelectSuggestion(option)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-primary-50 rounded-xl transition-all text-sm"
                  >
                    <span className="text-lg">{option.emoji}</span>
                    <span className="text-gray-700">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!showSuggestions && !editingTask && (
            <button
              type="button"
              onClick={() => setShowSuggestions(true)}
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>显示建议任务</span>
            </button>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                任务名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：扫地"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图标表情
              </label>
              <div className="flex flex-wrap gap-2">
                {['🧹', '🪣', '🗑️', '🍳', '🍽️', '🪑', '🪴', '🛋️', '🚽', '📦', '🧽', '🧼', '🪟', '🧺', '🔧'].map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`w-12 h-12 text-2xl rounded-xl transition-all ${
                      emoji === e
                        ? 'bg-primary-100 ring-2 ring-primary-500 scale-110'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                任务描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述一下这个任务需要做什么..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {houseRoommates.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-700">
                  ⚠️ 当前还没有添加室友，请先在首页添加室友，然后才能分配值日。
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-xl font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {editingTask ? '保存修改' : '添加任务'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
