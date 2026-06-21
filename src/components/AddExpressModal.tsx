import { useState, useEffect, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import type { Roommate } from '@/types';
import { X, Plus, ChevronDown, Package } from 'lucide-react';

interface AddExpressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_LOCATIONS = [
  '门口鞋柜',
  '客厅茶几',
  '厨房台面上',
  '冰箱旁',
  '书房书架',
  '阳台架子',
  '卫生间门口',
  '玄关收纳柜',
];

export function AddExpressModal({ isOpen, onClose }: AddExpressModalProps) {
  const { addExpressRecord, roommates, currentHouseId } = useBorrowStore();

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );

  const [trackingNumber, setTrackingNumber] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [courierId, setCourierId] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [note, setNote] = useState('');
  const [showRecipients, setShowRecipients] = useState(false);
  const [showCouriers, setShowCouriers] = useState(false);
  const [showLocations, setShowLocations] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTrackingNumber('');
      setRecipientId('');
      setCourierId(currentRoommates[0]?.id || '');
      setStorageLocation('');
      setNote('');
      setShowRecipients(false);
      setShowCouriers(false);
      setShowLocations(false);
    }
  }, [isOpen, currentRoommates]);

  const handleSelectRecipient = (roommate: Roommate) => {
    setRecipientId(roommate.id);
    setShowRecipients(false);
  };

  const handleSelectCourier = (roommate: Roommate) => {
    setCourierId(roommate.id);
    setShowCouriers(false);
  };

  const handleSelectLocation = (location: string) => {
    setStorageLocation(location);
    setShowLocations(false);
  };

  const handleSubmit = () => {
    if (!trackingNumber.trim() || !recipientId || !storageLocation.trim() || !courierId) return;

    const recipient = currentRoommates.find((r) => r.id === recipientId);
    const courier = currentRoommates.find((r) => r.id === courierId);
    if (!recipient || !courier) return;

    addExpressRecord({
      trackingNumber: trackingNumber.trim(),
      recipientId,
      recipientName: recipient.name,
      recipientAvatar: recipient.avatar,
      storageLocation: storageLocation.trim(),
      courierId,
      courierName: courier.name,
      courierAvatar: courier.avatar,
      note: note.trim() || undefined,
    });

    onClose();
  };

  const selectedRecipient = currentRoommates.find((r) => r.id === recipientId);
  const selectedCourier = currentRoommates.find((r) => r.id === courierId);

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
            <span className="text-2xl">📦</span>
            代收快递登记
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
              快递单号
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="请输入快递单号"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              收件人
            </label>
            <div className="relative">
              <button
                onClick={() => setShowRecipients(!showRecipients)}
                className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                {selectedRecipient ? (
                  <>
                    <span className="text-2xl">{selectedRecipient.avatar}</span>
                    <span className="text-gray-800">{selectedRecipient.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400">请选择收件人</span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
              </button>

              {showRecipients && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {currentRoommates.map((roommate) => (
                    <button
                      key={roommate.id}
                      onClick={() => handleSelectRecipient(roommate)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                        recipientId === roommate.id ? 'bg-primary-50' : ''
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              代收人（你）
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCouriers(!showCouriers)}
                className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                {selectedCourier ? (
                  <>
                    <span className="text-2xl">{selectedCourier.avatar}</span>
                    <span className="text-gray-800">{selectedCourier.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400">请选择代收人</span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
              </button>

              {showCouriers && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {currentRoommates.map((roommate) => (
                    <button
                      key={roommate.id}
                      onClick={() => handleSelectCourier(roommate)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                        courierId === roommate.id ? 'bg-primary-50' : ''
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              存放位置
            </label>
            <div className="relative">
              <button
                onClick={() => setShowLocations(!showLocations)}
                className="w-full flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                {storageLocation ? (
                  <span className="text-gray-800">{storageLocation}</span>
                ) : (
                  <span className="text-gray-400">请选择或输入存放位置</span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
              </button>

              {showLocations && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {STORAGE_LOCATIONS.map((location) => (
                      <button
                        key={location}
                        onClick={() => handleSelectLocation(location)}
                        className={`w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm ${
                          storageLocation === location ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input
              type="text"
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              placeholder="或手动输入存放位置"
              className="w-full mt-2 p-2 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注（可选）
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="比如：快递很大、需要冷藏、易碎等..."
              rows={3}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors resize-none text-sm"
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-primary-50 rounded-xl">
            <Package className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-primary-700">
              登记后，收件人会在首页看到未取件提醒，请及时通知收件人取件。
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!trackingNumber.trim() || !recipientId || !storageLocation.trim() || !courierId}
          className="w-full mt-6 py-4 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          确认登记
        </button>
      </div>
    </div>
  );
}
