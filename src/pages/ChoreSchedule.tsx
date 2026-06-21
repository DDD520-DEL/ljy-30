import { useState } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { Header } from '@/components/Header';
import { TabBar } from '@/components/TabBar';
import { ChoreTaskModal } from '@/components/ChoreTaskModal';
import { ChoreAssignModal } from '@/components/ChoreAssignModal';
import { EmptyState } from '@/components/EmptyState';
import { WEEKDAYS } from '@/data/constants';
import { Plus, RefreshCw, Settings, Trash2, UserPlus } from 'lucide-react';
import type { ChoreTask, DayOfWeek, ChoreAssignment } from '@/types';

export default function ChoreSchedule() {
  const {
    getChoreTasks,
    getChoreAssignmentsByTask,
    getChoreRotations,
    getChoreStats,
    deleteChoreTask,
    toggleChoreRotation,
    rotateChores,
    showChoreTaskModal,
    setShowChoreTaskModal,
    showChoreAssignModal,
    setShowChoreAssignModal,
    selectedChoreTask,
    setSelectedChoreTask,
    selectedChoreDay,
    setSelectedChoreDay,
  } = useBorrowStore();

  const [editingTask, setEditingTask] = useState<ChoreTask | null>(null);
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);

  const tasks = getChoreTasks();
  const rotations = getChoreRotations();
  const stats = getChoreStats();
  const today = new Date().getDay() as DayOfWeek;

  const getRotationEnabled = (taskId: string) => {
    return rotations.some((r) => r.taskId === taskId && r.enabled);
  };

  const getAssignmentsForCell = (taskId: string, day: DayOfWeek) => {
    const taskAssignments = getChoreAssignmentsByTask(taskId);
    return taskAssignments.filter((a) => a.dayOfWeek === day);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowChoreTaskModal(true);
  };

  const handleEditTask = (task: ChoreTask) => {
    setEditingTask(task);
    setShowChoreTaskModal(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('确定要删除这个任务吗？相关的排班安排也会被删除。')) {
      deleteChoreTask(taskId);
    }
  };

  const handleOpenAssignModal = (task: ChoreTask, day: DayOfWeek) => {
    setSelectedChoreTask(task);
    setSelectedChoreDay(day);
    setShowChoreAssignModal(true);
  };

  const handleRotateChores = () => {
    rotateChores();
    setShowRotateConfirm(false);
  };

  const getDayLabel = (day: DayOfWeek) => {
    const weekday = WEEKDAYS.find((w) => w.key === day);
    return weekday?.label || '';
  };

  const getWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const dates: Date[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - currentDay + i);
      dates.push(date);
    }
    
    return dates;
  };

  const weekDates = getWeekDates();
  const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto bg-cream min-h-screen relative pb-24">
        <Header />

        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🏠 家务排班</h1>
              <p className="text-sm text-gray-500 mt-1">
                本周 {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {stats.activeRotations > 0 && (
                <button
                  onClick={() => setShowRotateConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-all text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>轮换</span>
                </button>
              )}
              <button
                onClick={handleAddTask}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>添加任务</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-2xl font-bold text-primary-600">{stats.totalTasks}</p>
              <p className="text-xs text-gray-500">任务总数</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-2xl font-bold text-success-600">{stats.totalAssignments}</p>
              <p className="text-xs text-gray-500">排班数量</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-2xl font-bold text-warning-600">{stats.todayAssignments}</p>
              <p className="text-xs text-gray-500">今日值日</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-2xl font-bold text-purple-600">{stats.activeRotations}</p>
              <p className="text-xs text-gray-500">轮换中</p>
            </div>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="px-5">
            <EmptyState type="no-tasks" />
          </div>
        ) : (
          <div className="px-5 pb-4">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="sticky left-0 bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap z-10">
                        任务
                      </th>
                      {WEEKDAYS.map((weekday) => (
                        <th
                          key={weekday.key}
                          className={`px-2 py-3 text-center text-xs font-medium ${
                            weekday.key === today ? 'text-primary-600 bg-primary-50' : 'text-gray-500'
                          }`}
                        >
                          <div>{weekday.short}</div>
                          <div className={`text-[10px] mt-0.5 ${
                            weekday.key === today ? 'text-primary-500' : 'text-gray-400'
                          }`}>
                            {formatDate(weekDates[weekday.key])}
                          </div>
                        </th>
                      ))}
                      <th className="px-2 py-3 text-center text-xs font-medium text-gray-500">
                        <Settings className="w-4 h-4 mx-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, rowIndex) => {
                      const rotationEnabled = getRotationEnabled(task.id);
                      return (
                        <tr
                          key={task.id}
                          className={`border-t border-gray-100 ${
                            rowIndex % 2 === 1 ? 'bg-gray-50/50' : ''
                          } hover:bg-primary-50/50 transition-colors`}
                        >
                          <td className="sticky left-0 bg-inherit px-3 py-3 z-10">
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <span className="text-xl">{task.emoji}</span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{task.name}</p>
                                {rotationEnabled && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-full mt-0.5">
                                    <RefreshCw className="w-3 h-3" />
                                    轮换中
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          {WEEKDAYS.map((weekday) => {
                            const assignments = getAssignmentsForCell(task.id, weekday.key as DayOfWeek);
                            const isToday = weekday.key === today;
                            return (
                              <td
                                key={weekday.key}
                                className={`px-1.5 py-2 ${isToday ? 'bg-primary-50/50' : ''}`}
                              >
                                {assignments.length > 0 ? (
                                  <div className="space-y-1">
                                    {assignments.map((assignment) => (
                                      <AssignmentBadge
                                        key={assignment.id}
                                        assignment={assignment}
                                        isToday={isToday}
                                        onClick={() => handleOpenAssignModal(task, weekday.key as DayOfWeek)}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleOpenAssignModal(task, weekday.key as DayOfWeek)}
                                    className={`w-full h-8 flex items-center justify-center rounded-lg transition-all ${
                                      isToday
                                        ? 'bg-primary-100/50 hover:bg-primary-100 text-primary-400'
                                        : 'bg-gray-100/50 hover:bg-gray-100 text-gray-400'
                                    }`}
                                  >
                                    <UserPlus className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-2 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => toggleChoreRotation(task.id)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  rotationEnabled
                                    ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                                title={rotationEnabled ? '关闭轮换' : '开启轮换'}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditTask(task)}
                                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                                title="编辑任务"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                title="删除任务"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-3">📋 今日值日提醒</h3>
              <TodayChoreList />
            </div>
          </div>
        )}
      </div>

      <TabBar />

      <ChoreTaskModal
        isOpen={showChoreTaskModal}
        onClose={() => {
          setShowChoreTaskModal(false);
          setEditingTask(null);
        }}
        editingTask={editingTask}
      />

      <ChoreAssignModal
        isOpen={showChoreAssignModal}
        onClose={() => {
          setShowChoreAssignModal(false);
          setSelectedChoreTask(null);
          setSelectedChoreDay(null);
        }}
        task={selectedChoreTask}
        dayOfWeek={selectedChoreDay}
        dayLabel={selectedChoreDay !== null ? getDayLabel(selectedChoreDay) : ''}
      />

      {showRotateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">🔄 轮换排班</h3>
            <p className="text-sm text-gray-600 mb-6">
              确定要执行轮换吗？所有开启了轮换的任务将按照室友顺序轮换值日。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRotateConfirm(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleRotateChores}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-xl font-medium hover:shadow-md transition-all"
              >
                确定轮换
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssignmentBadge({
  assignment,
  isToday,
  onClick,
}: {
  assignment: ChoreAssignment;
  isToday: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80 ${
        isToday
          ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300'
          : 'text-gray-700'
      }`}
      style={{ backgroundColor: isToday ? undefined : `${assignment.roommateColor}20` }}
    >
      <span className="text-base shrink-0">{assignment.roommateAvatar}</span>
      <span className="truncate">{assignment.roommateName}</span>
    </button>
  );
}

function TodayChoreList() {
  const { getTodayChoreAssignments } = useBorrowStore();
  const todayAssignments = getTodayChoreAssignments();

  if (todayAssignments.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        🎉 今天没有人值日~
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {todayAssignments.map((assignment) => (
        <div
          key={assignment.id}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
        >
          <span className="text-2xl">{assignment.taskEmoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">{assignment.taskName}</p>
            <p className="text-xs text-gray-500">
              {assignment.roommateAvatar} {assignment.roommateName}
            </p>
          </div>
          <span
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: assignment.roommateColor }}
          >
            今日值日
          </span>
        </div>
      ))}
    </div>
  );
}
