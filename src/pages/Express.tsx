import { useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { ExpressCard } from '@/components/ExpressCard';
import { EmptyState } from '@/components/EmptyState';
import { AddExpressModal } from '@/components/AddExpressModal';
import { ExpressDetailModal } from '@/components/ExpressDetailModal';
import { TabBar } from '@/components/TabBar';
import { HouseSwitcher } from '@/components/HouseSwitcher';
import { Plus, Package, Clock, CheckCircle, Users } from 'lucide-react';
import { EXPRESS_FILTER_OPTIONS } from '@/data/constants';
import type { ExpressStatus, ExpressRecord } from '@/types';

export default function Express() {
  const {
    expressFilter,
    setExpressFilter,
    showAddExpressModal,
    setShowAddExpressModal,
    showExpressDetailModal,
    setShowExpressDetailModal,
    setShowHouseModal,
    setShowRoommateModal,
    setSelectedExpress,
    expressRecords: allExpressRecords,
    currentHouseId,
  } = useBorrowStore();

  const houseExpressRecords = useMemo(() => {
    return allExpressRecords.filter((r) => r.houseId === currentHouseId);
  }, [allExpressRecords, currentHouseId]);

  const expressRecords = useMemo(() => {
    let filtered = houseExpressRecords;
    if (expressFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === expressFilter);
    }
    return filtered.sort((a, b) => {
      if (expressFilter === 'all') {
        const statusOrder = { pending: 0, picked: 1 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [houseExpressRecords, expressFilter]);

  const stats = useMemo(() => {
    const records = houseExpressRecords;
    return {
      total: records.length,
      pending: records.filter((r) => r.status === 'pending').length,
      picked: records.filter((r) => r.status === 'picked').length,
    };
  }, [houseExpressRecords]);

  const getEmptyType = () => {
    switch (expressFilter) {
      case 'pending':
        return 'express-pending' as const;
      case 'picked':
        return 'express-picked' as const;
      default:
        return 'express-all' as const;
    }
  };

  const handleCardClick = (record: ExpressRecord) => {
    setSelectedExpress(record);
    setShowExpressDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white rounded-b-3xl px-5 py-6 shadow-lg mb-4">
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
          <Package className="w-7 h-7" />
          快递代收
        </h1>
        <p className="text-sm text-white/80 mt-1">帮室友代收快递，登记信息方便取件 ✨</p>
      </div>

      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-primary-500" />
              <span className="text-xs text-gray-500">全部</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary-500" />
              <span className="text-xs text-gray-500">待取件</span>
            </div>
            <p className="text-xl font-bold text-primary-500">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span className="text-xs text-gray-500">已签收</span>
            </div>
            <p className="text-xl font-bold text-success-500">{stats.picked}</p>
          </div>
        </div>

        {stats.total > 0 && (
          <div className="bg-white rounded-2xl p-3 mb-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="w-4 h-4 text-primary-500" />
                <span>取件进度</span>
              </div>
              <span className="text-sm font-semibold text-primary-600">
                {stats.total > 0 ? Math.round((stats.picked / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.picked / stats.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              共登记 {stats.total} 个快递，已签收 {stats.picked} 个
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {EXPRESS_FILTER_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setExpressFilter(option.key as ExpressStatus | 'all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                expressFilter === option.key
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-4">
          {expressRecords.length === 0 ? (
            <EmptyState type={getEmptyType()} />
          ) : (
            expressRecords.map((record) => (
              <ExpressCard
                key={record.id}
                record={record}
                onClick={() => handleCardClick(record)}
              />
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => setShowAddExpressModal(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      <TabBar />

      <AddExpressModal
        isOpen={showAddExpressModal}
        onClose={() => setShowAddExpressModal(false)}
      />

      <ExpressDetailModal
        isOpen={showExpressDetailModal}
        onClose={() => {
          setShowExpressDetailModal(false);
          setSelectedExpress(null);
        }}
      />
    </div>
  );
}
