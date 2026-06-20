import { useState, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { HouseSwitcher } from '@/components/HouseSwitcher';
import {
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Clock,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownAZ,
} from 'lucide-react';

export function Header() {
  const {
    getStats,
    setShowRoommateModal,
    setShowHouseModal,
    roommates,
    currentHouseId,
    searchQuery,
    setSearchQuery,
    selectedRoommateId,
    setSelectedRoommateId,
    sortType,
    setSortType,
    sortOrder,
    setSortOrder,
  } = useBorrowStore();

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );
  const stats = getStats();
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  return (
    <div className="bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white rounded-b-3xl px-5 py-6 shadow-lg">
      <div className="flex items-center justify-between mb-4 gap-2">
        <HouseSwitcher onManageClick={() => setShowHouseModal(true)} />
        <button
          onClick={() => setShowRoommateModal(true)}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all active:scale-95"
          title="室友管理"
        >
          <Users className="w-5 h-5" />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
        <input
          type="text"
          placeholder="搜索物品名称..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-10 py-3 bg-white/20 backdrop-blur rounded-2xl text-white placeholder-white/60 focus:outline-none focus:bg-white/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            showFilterPanel || selectedRoommateId || sortType !== 'returnDate' || sortOrder !== 'asc'
              ? 'bg-white text-primary-600 shadow-md'
              : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>筛选排序</span>
          {(selectedRoommateId || sortType !== 'returnDate' || sortOrder !== 'asc') && (
            <span className="w-2 h-2 bg-primary-500 rounded-full" />
          )}
        </button>

        {selectedRoommateId && (
          <div className="flex items-center gap-1 px-3 py-2 bg-white/20 backdrop-blur rounded-xl text-sm">
            <span>{currentRoommates.find((r) => r.id === selectedRoommateId)?.avatar}</span>
            <span>{currentRoommates.find((r) => r.id === selectedRoommateId)?.name}</span>
            <button
              onClick={() => setSelectedRoommateId(null)}
              className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {showFilterPanel && (
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-4 space-y-4 animate-fade-in">
          <div>
            <p className="text-xs text-white/80 mb-2 flex items-center gap-1">
              <Users className="w-3 h-3" />
              按室友筛选
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRoommateId(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedRoommateId === null
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                全部
              </button>
              {currentRoommates.map((roommate) => (
                <button
                  key={roommate.id}
                  onClick={() => setSelectedRoommateId(roommate.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    selectedRoommateId === roommate.id
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <span>{roommate.avatar}</span>
                  <span>{roommate.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-white/80 mb-2 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              排序方式
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSortType('returnDate')}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  sortType === 'returnDate'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Clock className="w-3 h-3" />
                归还日期
              </button>
              <button
                onClick={() => setSortType('createdAt')}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  sortType === 'createdAt'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <ChevronDown className="w-3 h-3" />
                创建时间
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-white/80 mb-2">排序顺序</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSortOrder('asc')}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  sortOrder === 'asc'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <ArrowUpAZ className="w-3 h-3" />
                {sortType === 'returnDate' ? '日期近→远' : '旧→新'}
              </button>
              <button
                onClick={() => setSortOrder('desc')}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  sortOrder === 'desc'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <ArrowDownAZ className="w-3 h-3" />
                {sortType === 'returnDate' ? '日期远→近' : '新→旧'}
              </button>
            </div>
          </div>
        </div>
      )}

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
