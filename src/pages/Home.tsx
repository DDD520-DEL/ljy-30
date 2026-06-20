import { useState, useCallback } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import type { BorrowRecord } from '@/types';
import { Header } from '@/components/Header';
import { FilterTabs } from '@/components/FilterTabs';
import { BorrowCard } from '@/components/BorrowCard';
import { EmptyState } from '@/components/EmptyState';
import { AddRecordModal } from '@/components/AddRecordModal';
import { RecordDetailModal } from '@/components/RecordDetailModal';
import { RoommateModal } from '@/components/RoommateModal';
import { InventoryModal } from '@/components/InventoryModal';
import { Celebration } from '@/components/Celebration';
import { ReturnReminderBanner } from '@/components/ReturnReminderBanner';
import { LowStockBanner } from '@/components/LowStockBanner';
import { useNotification } from '@/hooks/useNotification';
import { Plus, ChevronDown, ChevronUp, Package } from 'lucide-react';

export default function Home() {
  const {
    getSearchFilteredRecords,
    getSearchFilteredHistoryRecords,
    showHistory,
    toggleHistory,
    showRoommateModal,
    setShowRoommateModal,
    showInventoryModal,
    setShowInventoryModal,
    returnRecord,
    filter,
    searchQuery,
    selectedRoommateId,
    getInventoryStats,
  } = useBorrowStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const inventoryStats = getInventoryStats();

  const openRecordDetail = useCallback((recordOrId: BorrowRecord | string) => {
    if (typeof recordOrId === 'string') {
      const found = useBorrowStore.getState().records.find((r) => r.id === recordOrId);
      if (found) {
        setSelectedRecord(found);
        setShowDetailModal(true);
      }
    } else {
      setSelectedRecord(recordOrId);
      setShowDetailModal(true);
    }
  }, []);

  useNotification({
    onNotificationClick: (recordId) => {
      openRecordDetail(recordId);
    },
  });

  const activeRecords = getSearchFilteredRecords();
  const historyRecords = getSearchFilteredHistoryRecords();

  const hasActiveFilters = searchQuery.trim() !== '' || selectedRoommateId !== null;

  const handleReturn = (record: BorrowRecord) => {
    returnRecord(record.id);
    setCelebrate(true);
    setShowDetailModal(false);
    setSelectedRecord(null);
  };

  const handleCardClick = (record: BorrowRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto bg-cream min-h-screen relative pb-24">
        <ReturnReminderBanner onItemClick={(record) => openRecordDetail(record)} />
        <Header />

        <LowStockBanner />

        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <FilterTabs />
            <button
              onClick={() => setShowInventoryModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700"
            >
              <Package className="w-4 h-4 text-purple-500" />
              <span>库存</span>
              {inventoryStats.lowStock > 0 && (
                <span className="w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                  {inventoryStats.lowStock}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="space-y-3">
            {activeRecords.length === 0 ? (
              <EmptyState type={hasActiveFilters ? 'search' : filter === 'overdue' ? 'overdue' : 'active'} />
            ) : (
              activeRecords.map((record, index) => (
                <div key={record.id} style={{ animationDelay: `${index * 0.05}s` }}>
                  <BorrowCard
                    record={record}
                    onClick={() => handleCardClick(record)}
                    onReturn={() => handleReturn(record)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-5 pb-4">
          <button
            onClick={toggleHistory}
            className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span className="text-sm font-medium">
              📜 历史记录 ({historyRecords.length})
            </span>
            {showHistory ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showHistory && (
            <div className="space-y-2 mt-2 animate-fade-in">
              {historyRecords.length === 0 ? (
                <EmptyState type={hasActiveFilters ? 'search' : 'history'} />
              ) : (
                historyRecords.map((record) => (
                  <BorrowCard
                    key={record.id}
                    record={record}
                    isReturned
                    onClick={() => handleCardClick(record)}
                  />
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-40"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      <AddRecordModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <RecordDetailModal
        record={selectedRecord}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRecord(null);
        }}
        onReturn={() => selectedRecord && handleReturn(selectedRecord)}
      />

      <RoommateModal
        isOpen={showRoommateModal}
        onClose={() => setShowRoommateModal(false)}
      />

      <InventoryModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
      />

      <Celebration trigger={celebrate} onComplete={() => setCelebrate(false)} />
    </div>
  );
}
