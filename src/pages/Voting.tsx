import { useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { PollCard } from '@/components/PollCard';
import { EmptyState } from '@/components/EmptyState';
import { CreatePollModal } from '@/components/CreatePollModal';
import { PollDetailModal } from '@/components/PollDetailModal';
import { TabBar } from '@/components/TabBar';
import { HouseSwitcher } from '@/components/HouseSwitcher';
import { Plus, Vote, Clock, CheckCircle, Archive, TrendingUp, Users } from 'lucide-react';
import { POLL_FILTER_OPTIONS } from '@/data/constants';
import type { PollStatus } from '@/types';

export default function Voting() {
  const {
    pollFilter,
    setPollFilter,
    showCreatePollModal,
    setShowCreatePollModal,
    showPollDetailModal,
    setShowPollDetailModal,
    getPollsByStatus,
    getPollStats,
    setShowHouseModal,
    setShowRoommateModal,
  } = useBorrowStore();

  const polls = useMemo(() => getPollsByStatus(pollFilter), [pollFilter, getPollsByStatus]);
  const stats = getPollStats();

  const getEmptyType = () => {
    switch (pollFilter) {
      case 'active':
        return 'poll-active' as const;
      case 'ended':
        return 'poll-ended' as const;
      case 'archived':
        return 'poll-archived' as const;
      default:
        return 'poll-all' as const;
    }
  };

  const participationRate = useMemo(() => {
    const allPolls = getPollsByStatus('all');
    if (allPolls.length === 0) return 0;
    const totalEnded = allPolls.filter((p) => p.status !== 'active').length;
    return totalEnded > 0 ? Math.round((totalEnded / allPolls.length) * 100) : 0;
  }, [getPollsByStatus]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-info-400 via-info-500 to-info-600 text-white rounded-b-3xl px-5 py-6 shadow-lg mb-4">
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Vote className="w-7 h-7" />
          合租投票
        </h1>
        <p className="text-sm text-white/80 mt-1">民主决策，让室友生活更和谐 ✨</p>
      </div>

      <div className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Vote className="w-4 h-4 text-info-500" />
              <span className="text-xs text-gray-500">全部</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary-500" />
              <span className="text-xs text-gray-500">进行中</span>
            </div>
            <p className="text-xl font-bold text-primary-500">{stats.active}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span className="text-xs text-gray-500">已结束</span>
            </div>
            <p className="text-xl font-bold text-success-500">{stats.ended}</p>
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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 text-info-500" />
                <span>投票完成率</span>
              </div>
              <span className="text-sm font-semibold text-info-600">{participationRate}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-info-400 to-info-500 rounded-full transition-all duration-500"
                style={{ width: `${participationRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              共发起 {stats.total} 次投票，已完成 {stats.ended + stats.archived} 次
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {POLL_FILTER_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setPollFilter(option.key as PollStatus | 'all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                pollFilter === option.key
                  ? 'bg-info-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-4">
          {polls.length === 0 ? (
            <EmptyState type={getEmptyType()} />
          ) : (
            polls.map((poll) => <PollCard key={poll.id} poll={poll} />)
          )}
        </div>
      </div>

      <button
        onClick={() => setShowCreatePollModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-info-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-info-600 transition-all hover:scale-110 active:scale-95 z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      <CreatePollModal
        isOpen={showCreatePollModal}
        onClose={() => setShowCreatePollModal(false)}
      />

      <PollDetailModal
        isOpen={showPollDetailModal}
        onClose={() => {
          setShowPollDetailModal(false);
        }}
      />

      <TabBar />
    </div>
  );
}
