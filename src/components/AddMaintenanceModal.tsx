import { useState, useEffect, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { MAINTENANCE_ITEMS } from '@/data/constants';
import type { MaintenanceItemOption, Roommate } from '@/types';
import { X, Plus, ChevronDown, AlertCircle } from 'lucide-react';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMaintenanceModal({ isOpen, onClose }: AddMaintenanceModalProps) {
  const { addMaintenanceRecord, roommates, currentHouseId } = useBorrowStore();

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );

  const [itemName, setItemName] = useState('');
  const [itemEmoji, setItemEmoji] = useState('🔧');
  const [description, setDescription] = useState('');
  const [reporterId, setReporterId] = useState('');
  const [showItems, setShowItems] = useState(false);
  const [showRoommates, setShowRoommates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItemName('');
      setItemEmoji('🔧');
      setDescription('');
      setReporterId(currentRoommates[0]?.id || '');
      setShowItems(false);
      setShowRoommates(false);
    }
  }, [isOpen, currentRoommates]);

  const handleSelectItem = (item: MaintenanceItemOption) => {
    setItemName(item.name);
    setItemEmoji(item.emoji);
    setShowItems(false);
  };

  const handleSelectReporter = (roommate: Roommate) => {
    setReporterId(roommate.id);
    setShowRoommates(false);
  };

  const handleSubmit = () => {
    if (!itemName.trim() || !description.trim() || !reporterId) return;

    const reporter = currentRoommates.find((r) => r.id === reporterId);
    if (!reporter) return;

    addMaintenanceRecord({
      itemName: itemName.trim(),
      itemEmoji,
      description: description.trim(),
      reporterId,
      reporterName: reporter.name,
      reporterAvatar: reporter.avatar,
    });

    onClose();
  };

  const selectedReporter = currentRoommates.find((r) => r.id === reporterId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            报修登记
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              故障物品
            </label>
            <div className="relative">
              <div
                className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors"
                onClick={() => setShowItems(!showItems)}
              >
                <span className="text-2xl">{itemEmoji}</span>
                <span className={itemName ? 'text-gray-800' : 'text-gray-400'}>
                  {itemName || '选择故障物品'}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
              </div>

              {showItems && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="grid grid-cols-4 gap-1">
                      {MAINTENANCE_ITEMS.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => handleSelectItem(item)}
                          className="flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                            {item.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              故障描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请描述故障现象，比如：洗衣机脱水时噪音很大..."
              rows={4}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-warning-400 outline-none transition-colors resize-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              报修人
            </label>
            <div className="relative">
              <button
                onClick={() => setShowRoommates(!showRoommates)}
                className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                {selectedReporter ? (
                  <>
                    <span className="text-2xl">{selectedReporter.avatar}</span>
                    <span className="text-gray-800">{selectedReporter.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400">请选择报修人</span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
              </button>

              {showRoommates && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {currentRoommates.map((roommate) => (
                    <button
                      key={roommate.id}
                      onClick={() => handleSelectReporter(roommate)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                        reporterId === roommate.id ? 'bg-warning-50' : ''
                      }`}
                    >
                      <span className="text-2xl">{roommate.avatar}</span>
                      <span className="text-gray-800">{roommate.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-warning-50 rounded-xl">
            <AlertCircle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-warning-700">
              提交后，维修状态将显示为"待处理"，请联系室友安排维修。
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!itemName.trim() || !description.trim() || !reporterId}
          className="w-full mt-6 py-4 bg-gradient-to-r from-warning-400 to-warning-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          提交报修
        </button>
      </div>
    </div>
  );
}
