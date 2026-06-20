import { useState, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { HouseSwitcher } from '@/components/HouseSwitcher';
import { BillCard } from '@/components/BillCard';
import { AddBillModal } from '@/components/AddBillModal';
import { SettlementPanel } from '@/components/SettlementPanel';
import { TabBar } from '@/components/TabBar';
import { BILL_EMPTY_MESSAGES } from '@/data/constants';
import type { BillStatus } from '@/types';
import {
  Users,
  Plus,
  Wallet,
  Clock,
  CheckCircle,
  ListFilter,
} from 'lucide-react';

export default function Bills() {
  const {
    getFilteredBills,
    getBillStats,
    billFilter,
    setBillFilter,
    setShowRoommateModal,
    setShowHouseModal,
  } = useBorrowStore();

  const [showAddModal, setShowAddModal] = useState(false);

  const bills = getFilteredBills();
  const stats = getBillStats();

  const emptyMessage = useMemo(() => {
    const key = billFilter === 'all' ? 'all' : billFilter;
    const messages = BILL_EMPTY_MESSAGES[key as keyof typeof BILL_EMPTY_MESSAGES] || BILL_EMPTY_MESSAGES.all;
    return messages[Math.floor(Math.random() * messages.length)];
  }, [billFilter]);

  const filters: { key: BillStatus | 'all'; label: string; icon: typeof Wallet }[] = [
    { key: 'all', label: '全部', icon: ListFilter },
    { key: 'pending', label: '待结算', icon: Clock },
    { key: 'settled', label: '已结清', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto bg-cream min-h-screen relative pb-24">
        <div className="bg-gradient-to-br from-warning-400 via-orange-400 to-warning-500 text-white rounded-b-3xl px-5 py-6 shadow-lg">
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

          <div className="mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">💰</span>
              合租账单
            </h1>
            <p className="text-sm text-white/80 mt-1">公共费用轻松分摊，账目清清楚楚</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Wallet className="w-3.5 h-3.5" />
                <span className="text-xs text-white/80">总账单</span>
              </div>
              <div className="text-xl font-bold">{stats.total}</div>
              <div className="text-xs text-white/70">¥{stats.totalAmount.toFixed(2)}</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs text-white/80">待结算</span>
              </div>
              <div className={`text-xl font-bold ${stats.pending > 0 ? 'animate-pulse' : ''}`}>
                {stats.pending}
              </div>
              <div className="text-xs text-white/70">¥{stats.pendingAmount.toFixed(2)}</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs text-white/80">已结清</span>
              </div>
              <div className="text-xl font-bold">{stats.settled}</div>
              <div className="text-xs text-white/70">
                ¥{(stats.totalAmount - stats.pendingAmount).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <SettlementPanel />

          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
            {filters.map((f) => {
              const Icon = f.icon;
              const isActive = billFilter === f.key;
              const count =
                f.key === 'all'
                  ? stats.total
                  : f.key === 'pending'
                  ? stats.pending
                  : stats.settled;
              return (
                <button
                  key={f.key}
                  onClick={() => setBillFilter(f.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-warning-600 shadow-md'
                      : 'bg-white/60 text-gray-600 hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{f.label}</span>
                  {count > 0 && (
                    <span
                      className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs flex items-center justify-center ${
                        isActive ? 'bg-warning-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {bills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="text-6xl mb-4 animate-float">{emptyMessage.emoji}</div>
                <p className="text-gray-500 text-center text-sm">{emptyMessage.text}</p>
              </div>
            ) : (
              bills.map((bill, index) => (
                <div key={bill.id} style={{ animationDelay: `${index * 0.05}s` }}>
                  <BillCard bill={bill} />
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-warning-400 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-40"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      <TabBar />

      <AddBillModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
