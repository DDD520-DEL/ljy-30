import { useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { WishCard } from '@/components/WishCard';
import { EmptyState } from '@/components/EmptyState';
import { AddWishModal } from '@/components/AddWishModal';
import { WishDetailModal } from '@/components/WishDetailModal';
import { TabBar } from '@/components/TabBar';
import { Plus, Sparkles, Target, CheckCircle, Archive, TrendingUp } from 'lucide-react';
import { WISH_FILTER_OPTIONS } from '@/data/constants';
import type { WishStatus } from '@/types';

export default function WishList() {
  const {
    wishFilter,
    setWishFilter,
    showWishModal,
    setShowWishModal,
    showWishDetailModal,
    setShowWishDetailModal,
    getWishesByStatus,
    getWishStats,
  } = useBorrowStore();

  const wishes = useMemo(() => getWishesByStatus(wishFilter), [wishFilter, getWishesByStatus]);
  const stats = getWishStats();

  const getEmptyType = () => {
    switch (wishFilter) {
      case 'active': return 'wish-active' as const;
      case 'fulfilled': return 'wish-fulfilled' as const;
      case 'archived': return 'wish-archived' as const;
      default: return 'wish-all' as const;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-warning-400 via-warning-500 to-warning-600 text-white rounded-b-3xl px-5 py-6 shadow-lg mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-7 h-7" />
          心愿单
        </h1>
        <p className="text-sm text-white/80 mt-1">室友互助，让心愿成真 ✨
        </p>
      </div>

      <div className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-warning-500" />
              <span className="text-xs text-gray-500">全部</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-warning-500" />
              <span className="text-xs text-gray-500">待借出</span>
            </div>
            <p className="text-xl font-bold text-warning-500">{stats.active}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span className="text-xs text-gray-500">已借出</span>
            </div>
            <p className="text-xl font-bold text-success-500">{stats.fulfilled}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Archive className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">已归档</span>
            </div>
            <p className="text-xl font-bold text-gray-500">{stats.archived}</p>
          </div>
        </div>

        {stats.total > 0 && (
          <div className="bg-white rounded-2xl p-3 mb-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              <span>心愿实现率</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-warning-400 to-success-400 rounded-full transition-all duration-500"
                style={{
                  width: `${stats.total > 0 ? ((stats.fulfilled + stats.archived) / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {stats.total > 0 ? Math.round(((stats.fulfilled + stats.archived) / stats.total) * 100) : 0}%
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {WISH_FILTER_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setWishFilter(option.key as WishStatus | 'all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                wishFilter === option.key
                  ? 'bg-warning-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-4">
          {wishes.length === 0 ? (
            <EmptyState type={getEmptyType()} />
          ) : (
            wishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => setShowWishModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-warning-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-warning-600 transition-all hover:scale-110 active:scale-95 z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      <AddWishModal
        isOpen={showWishModal}
        onClose={() => setShowWishModal(false)}
      />

      <WishDetailModal
        isOpen={showWishDetailModal}
        onClose={() => setShowWishDetailModal(false)}
      />

      <TabBar />
    </div>
  );
}
