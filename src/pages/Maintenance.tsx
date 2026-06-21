import { useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { MaintenanceCard } from '@/components/MaintenanceCard';
import { EmptyState } from '@/components/EmptyState';
import { AddMaintenanceModal } from '@/components/AddMaintenanceModal';
import { MaintenanceDetailModal } from '@/components/MaintenanceDetailModal';
import { TabBar } from '@/components/TabBar';
import { HouseSwitcher } from '@/components/HouseSwitcher';
import { Plus, Wrench, Clock, CheckCircle, TrendingUp, Users, DollarSign } from 'lucide-react';
import { MAINTENANCE_FILTER_OPTIONS } from '@/data/constants';
import type { MaintenanceStatus } from '@/types';

export default function Maintenance() {
  const {
    maintenanceFilter,
    setMaintenanceFilter,
    showAddMaintenanceModal,
    setShowAddMaintenanceModal,
    showMaintenanceDetailModal,
    setShowMaintenanceDetailModal,
    setShowHouseModal,
    setShowRoommateModal,
    setSelectedMaintenance,
    getMaintenanceRecordsByStatus,
    getMaintenanceStats,
    currentHouseId,
  } = useBorrowStore();

  const maintenanceRecords = useMemo(() => {
    return getMaintenanceRecordsByStatus(maintenanceFilter);
  }, [maintenanceFilter, getMaintenanceRecordsByStatus, currentHouseId]);

  const stats = useMemo(() => {
    return getMaintenanceStats();
  }, [getMaintenanceStats, currentHouseId]);

  const getEmptyType = () => {
    switch (maintenanceFilter) {
      case 'pending':
        return 'maintenance-pending' as const;
      case 'repairing':
        return 'maintenance-repairing' as const;
      case 'completed':
        return 'maintenance-completed' as const;
      default:
        return 'maintenance-all' as const;
    }
  };

  const handleCardClick = (record: any) => {
    setSelectedMaintenance(record);
    setShowMaintenanceDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-warning-400 via-warning-500 to-warning-600 text-white rounded-b-3xl px-5 py-6 shadow-lg mb-4">
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
          <Wrench className="w-7 h-7" />
          物品维修
        </h1>
        <p className="text-sm text-white/80 mt-1">公共物品维修登记，让合租生活更安心 ✨</p>
      </div>

      <div className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-warning-500" />
              <span className="text-xs text-gray-500">全部</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-warning-500" />
              <span className="text-xs text-gray-500">待处理</span>
            </div>
            <p className="text-xl font-bold text-warning-500">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-info-500" />
              <span className="text-xs text-gray-500">维修中</span>
            </div>
            <p className="text-xl font-bold text-info-500">{stats.repairing}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span className="text-xs text-gray-500">已修好</span>
            </div>
            <p className="text-xl font-bold text-success-500">{stats.completed}</p>
          </div>
        </div>

        {stats.total > 0 && (
          <div className="bg-white rounded-2xl p-3 mb-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4 text-warning-500" />
                <span>累计维修费用</span>
              </div>
              <span className="text-sm font-semibold text-warning-600">¥{stats.totalCost.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-warning-400 to-warning-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              共报修 {stats.total} 次，已完成 {stats.completed} 次
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {MAINTENANCE_FILTER_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setMaintenanceFilter(option.key as MaintenanceStatus | 'all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                maintenanceFilter === option.key
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
          {maintenanceRecords.length === 0 ? (
            <EmptyState type={getEmptyType()} />
          ) : (
            maintenanceRecords.map((record) => (
              <MaintenanceCard
                key={record.id}
                record={record}
                onClick={() => handleCardClick(record)}
              />
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => setShowAddMaintenanceModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-warning-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-warning-600 transition-all hover:scale-110 active:scale-95 z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      <AddMaintenanceModal
        isOpen={showAddMaintenanceModal}
        onClose={() => setShowAddMaintenanceModal(false)}
      />

      <MaintenanceDetailModal
        isOpen={showMaintenanceDetailModal}
        onClose={() => {
          setShowMaintenanceDetailModal(false);
        }}
      />

      <TabBar />
    </div>
  );
}
