import { useBorrowStore } from '@/store/useBorrowStore';
import { Users, ArrowUpRight, ArrowDownLeft, AlertTriangle, Clock } from 'lucide-react';

export function Header() {
  const { getStats, setShowRoommateModal } = useBorrowStore();
  const stats = getStats();

  return (
    <div className="bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white rounded-b-3xl px-5 py-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🏠</span>
            室友借还板
          </h1>
          <p className="text-white/80 text-sm mt-1">记录生活中的点点滴滴~</p>
        </div>
        <button
          onClick={() => setShowRoommateModal(true)}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all active:scale-95"
        >
          <Users className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-xs text-white/80">借出</span>
          </div>
          <div className="text-2xl font-bold">{stats.lend}</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowDownLeft className="w-4 h-4" />
            <span className="text-xs text-white/80">借入</span>
          </div>
          <div className="text-2xl font-bold">{stats.borrow}</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {stats.overdue > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span className="text-xs text-white/80">{stats.overdue > 0 ? '逾期' : '今日到期'}</span>
          </div>
          <div className={`text-2xl font-bold ${stats.overdue > 0 ? 'animate-pulse' : ''}`}>
            {stats.overdue > 0 ? stats.overdue : stats.todayDue}
          </div>
        </div>
      </div>

      {stats.overdue > 0 && (
        <div className="mt-4 bg-white/20 backdrop-blur rounded-xl p-3 text-sm flex items-center gap-2 animate-pulse">
          <span className="text-lg">⏰</span>
          <span>有 {stats.overdue} 个物品已经逾期啦，快去催催~</span>
        </div>
      )}
    </div>
  );
}
