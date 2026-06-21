import { useState, useCallback, useRef } from 'react';
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
import { HouseModal } from '@/components/HouseModal';
import { Celebration } from '@/components/Celebration';
import { CompensationModal } from '@/components/CompensationModal';
import { ReturnReminderBanner } from '@/components/ReturnReminderBanner';
import { LowStockBanner } from '@/components/LowStockBanner';
import { ChoreReminderBanner } from '@/components/ChoreReminderBanner';
import { AnnouncementMarquee } from '@/components/AnnouncementMarquee';
import { AnnouncementModal } from '@/components/AnnouncementModal';
import { TabBar } from '@/components/TabBar';
import { useNotification } from '@/hooks/useNotification';
import { Plus, ChevronDown, ChevronUp, Package, Download, Upload } from 'lucide-react';
import { recordsToCSV, csvToRecords, downloadCSV, formatDateForFilename } from '@/utils/csv';

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
    showHouseModal,
    setShowHouseModal,
    showAnnouncementModal,
    setShowAnnouncementModal,
    returnRecord,
    filter,
    searchQuery,
    selectedRoommateId,
    getInventoryStats,
    importRecords,
  } = useBorrowStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCompensationModal, setShowCompensationModal] = useState(false);
  const [compensationBorrowRecordId, setCompensationBorrowRecordId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleReturn = (record: BorrowRecord, options?: { isDamaged?: boolean; damageDescription?: string; compensationAmount?: number }) => {
    returnRecord(record.id, options);
    setCelebrate(true);
    setShowDetailModal(false);
    setSelectedRecord(null);
  };

  const handleOpenCompensation = (borrowRecordId: string) => {
    setCompensationBorrowRecordId(borrowRecordId);
    setShowCompensationModal(true);
    setShowDetailModal(false);
  };

  const handleCardClick = (record: BorrowRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleExport = () => {
    const recordsToExport = showHistory ? historyRecords : activeRecords;
    if (recordsToExport.length === 0) {
      alert('当前视图下没有可导出的记录');
      return;
    }
    const csvContent = recordsToCSV(recordsToExport);
    const filename = `借用记录_${formatDateForFilename(new Date())}.csv`;
    downloadCSV(csvContent, filename);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const records = csvToRecords(text);

      if (records.length === 0) {
        alert('CSV 文件中没有有效的记录');
        return;
      }

      const confirmMsg = `即将导入 ${records.length} 条记录，是否继续？\n（重复记录将自动跳过）`;
      if (!window.confirm(confirmMsg)) {
        return;
      }

      const result = importRecords(records);
      alert(
        `导入完成！\n\n成功导入: ${result.added} 条\n重复跳过: ${result.duplicates} 条`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : '导入失败，请检查文件格式';
      alert(`导入失败：${message}`);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto bg-cream min-h-screen relative pb-24">
        <AnnouncementMarquee onOpenAnnouncementModal={() => setShowAnnouncementModal(true)} />
        <ReturnReminderBanner onItemClick={(record) => openRecordDetail(record)} />
        <ChoreReminderBanner />
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
          <div className="flex items-center justify-between">
            <button
              onClick={toggleHistory}
              className="flex items-center gap-2 py-3 text-gray-500 hover:text-gray-700 transition-colors"
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

            <div className="flex items-center gap-2">
              <button
                onClick={handleImportClick}
                className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-xs font-medium text-gray-600 hover:text-gray-800"
                title="从 CSV 文件导入记录"
              >
                <Upload className="w-3.5 h-3.5 text-primary-500" />
                <span>导入</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-xs font-medium text-gray-600 hover:text-gray-800"
                title="导出当前视图下的记录为 CSV"
              >
                <Download className="w-3.5 h-3.5 text-success-500" />
                <span>导出</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>

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
          className="fixed bottom-20 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-40"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      <TabBar />

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
        onReturn={(options) => selectedRecord && handleReturn(selectedRecord, options)}
        onOpenCompensation={handleOpenCompensation}
      />

      <CompensationModal
        borrowRecordId={compensationBorrowRecordId}
        isOpen={showCompensationModal}
        onClose={() => {
          setShowCompensationModal(false);
          setCompensationBorrowRecordId(null);
        }}
      />

      <RoommateModal
        isOpen={showRoommateModal}
        onClose={() => setShowRoommateModal(false)}
      />

      <InventoryModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
      />

      <HouseModal
        isOpen={showHouseModal}
        onClose={() => setShowHouseModal(false)}
      />

      <AnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
      />

      <Celebration trigger={celebrate} onComplete={() => setCelebrate(false)} />
    </div>
  );
}
