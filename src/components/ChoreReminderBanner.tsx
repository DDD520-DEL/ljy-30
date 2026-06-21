import { useState } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { ChevronDown, ChevronUp, Bell, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ChoreReminderBanner() {
  const { getTodayChoreAssignments } = useBorrowStore();
  const todayAssignments = getTodayChoreAssignments();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (todayAssignments.length === 0 || dismissed) return null;

  const summaryText = `今天有 ${todayAssignments.length} 项家务`;

  const handleViewSchedule = () => {
    navigate('/chores');
  };

  return (
    <div className="bg-gradient-to-r from-success-500 to-primary-500 text-white animate-fade-in">
      <div className="max-w-md mx-auto">
        <div
          className="flex items-center justify-between px-5 py-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-5 h-5 shrink-0 animate-pulse-soft" />
            <span className="text-sm font-medium truncate">
              🧹 值日提醒：{summaryText}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDismissed(true);
              }}
              className="p-1 hover:bg-white/20 rounded-full transition-colors ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-3 space-y-2 animate-fade-in">
            {todayAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center gap-3 bg-white/20 backdrop-blur rounded-xl px-3 py-2.5"
              >
                <span className="text-2xl shrink-0">{assignment.taskEmoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{assignment.taskName}</p>
                  <p className="text-xs text-white/80">
                    值日：{assignment.roommateAvatar} {assignment.roommateName}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium bg-white/30"
                >
                  今日
                </span>
              </div>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewSchedule();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all"
            >
              <Bell className="w-4 h-4" />
              查看完整排班表
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
