import { useState, useEffect, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { X, Wrench, Check, Clock, DollarSign, User, Calendar, Trash2, ChevronDown, AlertCircle } from 'lucide-react';
import type { Roommate, MaintenanceStatus } from '@/types';

interface MaintenanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MaintenanceDetailModal({ isOpen, onClose }: MaintenanceDetailModalProps) {
  const {
    selectedMaintenance,
    roommates,
    currentHouseId,
    announcementRoommateId,
    setAnnouncementRoommateId,
    startMaintenance,
    completeMaintenance,
    deleteMaintenanceRecord,
    setShowMaintenanceDetailModal,
    setSelectedMaintenance,
  } = useBorrowStore();

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );

  const resolvedRoommateId = useMemo(() => {
    if (announcementRoommateId && currentRoommates.some((r) => r.id === announcementRoommateId)) {
      return announcementRoommateId;
    }
    return currentRoommates[0]?.id || '';
  }, [announcementRoommateId, currentRoommates]);

  useEffect(() => {
    if (!announcementRoommateId || !currentRoommates.some((r) => r.id === announcementRoommateId)) {
      if (currentRoommates.length > 0 && announcementRoommateId !== currentRoommates[0].id) {
        setAnnouncementRoommateId(currentRoommates[0].id);
      }
    }
  }, [currentRoommates, announcementRoommateId, setAnnouncementRoommateId]);

  const [repairerId, setRepairerId] = useState('');
  const [cost, setCost] = useState('');
  const [repairNote, setRepairNote] = useState('');
  const [showRepairers, setShowRepairers] = useState(false);

  useEffect(() => {
    if (isOpen && selectedMaintenance) {
      setRepairerId(currentRoommates[0]?.id || '');
      setCost('');
      setRepairNote('');
      setShowRepairers(false);
    }
  }, [isOpen, selectedMaintenance, currentRoommates]);

  if (!isOpen || !selectedMaintenance) return null;

  const record = selectedMaintenance;
  const selectedRepairer = currentRoommates.find((r) => r.id === repairerId);

  const getStatusConfig = (status: MaintenanceStatus) => {
    switch (status) {
      case 'pending':
        return { label: '待处理', color: 'text-warning-600', bgColor: 'bg-warning-100', borderColor: 'border-warning-200', icon: Clock };
      case 'repairing':
        return { label: '维修中', color: 'text-info-600', bgColor: 'bg-info-100', borderColor: 'border-info-200', icon: Wrench };
      case 'completed':
        return { label: '已修好', color: 'text-success-600', bgColor: 'bg-success-100', borderColor: 'border-success-200', icon: Check };
      default:
        return { label: '未知', color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-200', icon: AlertCircle };
    }
  };

  const statusConfig = getStatusConfig(record.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectRepairer = (roommate: Roommate) => {
    setRepairerId(roommate.id);
    setShowRepairers(false);
  };

  const handleStartRepair = () => {
    if (!repairerId) return;
    const repairer = currentRoommates.find((r) => r.id === repairerId);
    if (!repairer) return;
    startMaintenance(record.id, repairer.id, repairer.name, repairer.avatar);
  };

  const handleCompleteRepair = () => {
    const costNum = parseFloat(cost) || 0;
    if (!repairNote.trim()) return;
    completeMaintenance(record.id, costNum, repairNote.trim());
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这条维修记录吗？此操作不可撤销。')) {
      deleteMaintenanceRecord(record.id);
      setSelectedMaintenance(null);
      setShowMaintenanceDetailModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {record.itemEmoji}
            维修详情
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${statusConfig.bgColor} rounded-2xl flex items-center justify-center text-3xl flex-shrink-0`}>
                {record.itemEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">{record.itemName}</h1>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs text-gray-500 mb-1.5 font-medium">故障描述</p>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.description}</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <span className="text-xl">{record.reporterAvatar}</span>
                <div>
                  <p className="text-xs text-gray-500">报修人</p>
                  <p className="text-sm font-medium text-gray-800">{record.reporterName}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(record.reportedAt)}</span>
                </div>
              </div>

              {record.repairerName && (
                <div className="flex items-center gap-2 p-3 bg-info-50 rounded-xl">
                  <span className="text-xl">{record.repairerAvatar}</span>
                  <div>
                    <p className="text-xs text-gray-500">维修人</p>
                    <p className="text-sm font-medium text-gray-800">{record.repairerName}</p>
                  </div>
                  {record.startedAt && (
                    <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                      <Wrench className="w-3 h-3" />
                      <span>开始于 {formatDate(record.startedAt)}</span>
                    </div>
                  )}
                </div>
              )}

              {record.status === 'completed' && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-success-50 rounded-xl">
                    <DollarSign className="w-5 h-5 text-success-500" />
                    <div>
                      <p className="text-xs text-gray-500">维修费用</p>
                      <p className="text-sm font-bold text-success-600">¥{record.cost}</p>
                    </div>
                    {record.completedAt && (
                      <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                        <Check className="w-3 h-3" />
                        <span>完成于 {formatDate(record.completedAt)}</span>
                      </div>
                    )}
                  </div>

                  {record.repairNote && (
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">维修备注</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.repairNote}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {record.status === 'pending' && (
              <div className="mb-5">
                <p className="text-xs text-gray-500 mb-2 font-medium">选择维修人</p>
                <div className="relative">
                  <button
                    onClick={() => setShowRepairers(!showRepairers)}
                    className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                  >
                    {selectedRepairer ? (
                      <>
                        <span className="text-2xl">{selectedRepairer.avatar}</span>
                        <span className="text-gray-800">{selectedRepairer.name}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">请选择维修人</span>
                    )}
                    <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
                  </button>

                  {showRepairers && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                      {currentRoommates.map((roommate) => (
                        <button
                          key={roommate.id}
                          onClick={() => handleSelectRepairer(roommate)}
                          className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                            repairerId === roommate.id ? 'bg-info-50' : ''
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
            )}

            {record.status === 'repairing' && (
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    维修费用 (元)
                  </label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="输入维修费用，免费请填0"
                    min="0"
                    step="0.01"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-success-400 outline-none transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    维修备注
                  </label>
                  <textarea
                    value={repairNote}
                    onChange={(e) => setRepairNote(e.target.value)}
                    placeholder="请描述维修过程和更换的零件..."
                    rows={3}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-success-400 outline-none transition-colors resize-none text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-white flex-shrink-0 space-y-2">
          {record.status === 'pending' && (
            <div className="space-y-2">
              <button
                onClick={handleStartRepair}
                disabled={!repairerId}
                className="w-full py-3 bg-info-500 text-white rounded-xl text-sm font-semibold hover:bg-info-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                开始维修
              </button>
              <button
                onClick={handleDelete}
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                删除记录
              </button>
            </div>
          )}

          {record.status === 'repairing' && (
            <div className="space-y-2">
              <button
                onClick={handleCompleteRepair}
                disabled={!repairNote.trim()}
                className="w-full py-3 bg-success-500 text-white rounded-xl text-sm font-semibold hover:bg-success-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                完成维修
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          )}

          {record.status === 'completed' && (
            <div className="space-y-2">
              <button
                onClick={handleDelete}
                className="w-full py-3 bg-danger-50 text-danger-600 rounded-xl text-sm font-medium hover:bg-danger-100 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                删除记录
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
