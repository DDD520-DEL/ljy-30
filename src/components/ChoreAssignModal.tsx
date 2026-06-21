import { useState, useEffect } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { X, Check, Trash2, UserPlus } from 'lucide-react';
import type { ChoreTask, DayOfWeek, Roommate } from '@/types';

interface ChoreAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ChoreTask | null;
  dayOfWeek: DayOfWeek | null;
  dayLabel: string;
}

export function ChoreAssignModal({ isOpen, onClose, task, dayOfWeek, dayLabel }: ChoreAssignModalProps) {
  const {
    roommates,
    currentHouseId,
    getChoreAssignmentsByTask,
    addChoreAssignment,
    deleteChoreAssignment,
  } = useBorrowStore();

  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null);

  const houseRoommates = roommates.filter((r) => r.houseId === currentHouseId);
  const currentAssignments = task && dayOfWeek !== null
    ? getChoreAssignmentsByTask(task.id).filter((a) => a.dayOfWeek === dayOfWeek)
    : [];

  useEffect(() => {
    setSelectedRoommate(null);
  }, [isOpen, task, dayOfWeek]);

  const handleAssign = () => {
    if (!task || dayOfWeek === null || !selectedRoommate) return;

    addChoreAssignment({
      taskId: task.id,
      taskName: task.name,
      taskEmoji: task.emoji,
      dayOfWeek,
      roommateId: selectedRoommate.id,
      roommateName: selectedRoommate.name,
      roommateAvatar: selectedRoommate.avatar,
      roommateColor: selectedRoommate.color,
    });
    setSelectedRoommate(null);
  };

  const handleRemove = (assignmentId: string) => {
    if (confirm('确定要移除这个值日安排吗？')) {
      deleteChoreAssignment(assignmentId);
    }
  };

  if (!isOpen || !task || dayOfWeek === null) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {task.emoji} 分配 {task.name}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{dayLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {currentAssignments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">当前安排</h3>
              <div className="space-y-2">
                {currentAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{assignment.roommateAvatar}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{assignment.roommateName}</p>
                        <p className="text-xs text-gray-500">{assignment.taskName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(assignment.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">选择室友</h3>
            {houseRoommates.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-700">
                  ⚠️ 还没有添加室友，请先在首页添加室友。
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {houseRoommates.map((roommate) => {
                  const isAssigned = currentAssignments.some(
                    (a) => a.roommateId === roommate.id
                  );
                  const isSelected = selectedRoommate?.id === roommate.id;

                  return (
                    <button
                      key={roommate.id}
                      type="button"
                      disabled={isAssigned}
                      onClick={() => setSelectedRoommate(roommate)}
                      className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                        isAssigned
                          ? 'bg-gray-100 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-primary-100 ring-2 ring-primary-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{roommate.avatar}</span>
                      <div className="text-left min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isAssigned ? 'text-gray-400' : 'text-gray-800'
                        }`}>
                          {roommate.name}
                        </p>
                        {isAssigned && (
                          <p className="text-xs text-gray-400">已安排</p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary-600 ml-auto shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              关闭
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedRoommate || houseRoommates.length === 0}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-xl font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              添加值日
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
