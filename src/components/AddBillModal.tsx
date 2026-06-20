import { useState, useEffect, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { BILL_CATEGORIES } from '@/data/constants';
import type { BillCategory, SplitMode, BillParticipant } from '@/types';
import { X, Plus, ChevronDown, Check, Users, Calculator } from 'lucide-react';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBillModal({ isOpen, onClose }: AddBillModalProps) {
  const { addBill, roommates, currentHouseId } = useBorrowStore();

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );

  const [category, setCategory] = useState<BillCategory>('electricity');
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [selectedRoommateIds, setSelectedRoommateIds] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [billDate, setBillDate] = useState('');
  const [note, setNote] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [showPayers, setShowPayers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCategory('electricity');
      setTitle('');
      setTotalAmount('');
      setPayerId(currentRoommates[0]?.id || '');
      setSplitMode('equal');
      setSelectedRoommateIds(currentRoommates.map((r) => r.id));
      setCustomAmounts({});
      const today = new Date();
      setBillDate(today.toISOString().split('T')[0]);
      setNote('');
      setShowCategories(false);
      setShowPayers(false);
    }
  }, [isOpen, currentRoommates]);

  const selectedCategory = BILL_CATEGORIES.find((c) => c.key === category);
  const selectedPayer = currentRoommates.find((r) => r.id === payerId);
  const selectedRoommates = currentRoommates.filter((r) => selectedRoommateIds.includes(r.id));

  const toggleRoommate = (roommateId: string) => {
    setSelectedRoommateIds((prev) => {
      if (prev.includes(roommateId)) {
        return prev.filter((id) => id !== roommateId);
      }
      return [...prev, roommateId];
    });
  };

  const equalShare = useMemo(() => {
    const total = parseFloat(totalAmount) || 0;
    if (selectedRoommateIds.length === 0 || total <= 0) return 0;
    return Math.round((total / selectedRoommateIds.length) * 100) / 100;
  }, [totalAmount, selectedRoommateIds.length]);

  const customSum = useMemo(() => {
    return selectedRoommateIds.reduce((sum, id) => {
      return sum + (parseFloat(customAmounts[id]) || 0);
    }, 0);
  }, [customAmounts, selectedRoommateIds]);

  const isValid = useMemo(() => {
    if (!title.trim()) return false;
    const total = parseFloat(totalAmount);
    if (!total || total <= 0) return false;
    if (!payerId) return false;
    if (selectedRoommateIds.length === 0) return false;
    if (splitMode === 'custom') {
      if (Math.abs(customSum - total) > 0.01) return false;
      for (const id of selectedRoommateIds) {
        const amount = parseFloat(customAmounts[id]);
        if (!amount || amount < 0) return false;
      }
    }
    return true;
  }, [title, totalAmount, payerId, selectedRoommateIds, splitMode, customSum, customAmounts]);

  const handleSubmit = () => {
    if (!isValid || !selectedPayer) return;

    const total = parseFloat(totalAmount);
    let participants: BillParticipant[] = [];

    if (splitMode === 'equal') {
      participants = selectedRoommates.map((r) => ({
        roommateId: r.id,
        roommateName: r.name,
        roommateAvatar: r.avatar,
        amount: equalShare,
        paid: r.id === payerId,
        paidAt: r.id === payerId ? new Date().toISOString() : undefined,
      }));
    } else {
      participants = selectedRoommates.map((r) => ({
        roommateId: r.id,
        roommateName: r.name,
        roommateAvatar: r.avatar,
        amount: parseFloat(customAmounts[r.id]) || 0,
        paid: r.id === payerId,
        paidAt: r.id === payerId ? new Date().toISOString() : undefined,
      }));
    }

    addBill({
      category,
      title: title.trim(),
      emoji: selectedCategory?.emoji || '💰',
      totalAmount: total,
      payerId: selectedPayer.id,
      payerName: selectedPayer.name,
      payerAvatar: selectedPayer.avatar,
      splitMode,
      participants,
      billDate: billDate ? new Date(billDate).toISOString() : new Date().toISOString(),
      note: note.trim() || undefined,
    });

    onClose();
  };

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
            <span className="text-2xl">💰</span>
            添加账单
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
              费用类型
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                <span className="text-2xl">{selectedCategory?.emoji}</span>
                <span className="text-gray-800">{selectedCategory?.name}</span>
                <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
              </button>

              {showCategories && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                  {BILL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setCategory(cat.key);
                        if (!title.trim()) {
                          setTitle(cat.name);
                        }
                        setShowCategories(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                        category === cat.key ? 'bg-primary-50' : ''
                      }`}
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="text-gray-800">{cat.name}</span>
                      {category === cat.key && (
                        <Check className="w-5 h-5 text-primary-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              账单标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="比如：6月份电费"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              总金额 (元)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-500">
                ¥
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors text-gray-800 placeholder-gray-400 text-xl font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              付款人
            </label>
            <div className="relative">
              <button
                onClick={() => setShowPayers(!showPayers)}
                className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                {selectedPayer ? (
                  <>
                    <span className="text-2xl">{selectedPayer.avatar}</span>
                    <span className="text-gray-800">{selectedPayer.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400">请选择付款人</span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
              </button>

              {showPayers && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {currentRoommates.map((roommate) => (
                    <button
                      key={roommate.id}
                      onClick={() => {
                        setPayerId(roommate.id);
                        setShowPayers(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                        payerId === roommate.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <span className="text-2xl">{roommate.avatar}</span>
                      <span className="text-gray-800">{roommate.name}</span>
                      {payerId === roommate.id && (
                        <Check className="w-5 h-5 text-primary-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              账单日期
            </label>
            <input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                参与分摊的室友
              </label>
              <button
                onClick={() => {
                  if (selectedRoommateIds.length === currentRoommates.length) {
                    setSelectedRoommateIds([]);
                  } else {
                    setSelectedRoommateIds(currentRoommates.map((r) => r.id));
                  }
                }}
                className="text-xs text-primary-500 hover:text-primary-600"
              >
                {selectedRoommateIds.length === currentRoommates.length ? '全不选' : '全选'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {currentRoommates.map((roommate) => {
                const isSelected = selectedRoommateIds.includes(roommate.id);
                return (
                  <button
                    key={roommate.id}
                    onClick={() => toggleRoommate(roommate.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'border-2 border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xl">{roommate.avatar}</span>
                    <span className={`text-sm ${isSelected ? 'text-primary-700 font-medium' : 'text-gray-600'}`}>
                      {roommate.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              分摊方式
            </label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
              <button
                onClick={() => setSplitMode('equal')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                  splitMode === 'equal'
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'text-gray-500'
                }`}
              >
                🪄 平均分摊
              </button>
              <button
                onClick={() => setSplitMode('custom')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                  splitMode === 'custom'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-500'
                }`}
              >
                ✏️ 自定义金额
              </button>
            </div>
          </div>

          {splitMode === 'equal' && selectedRoommateIds.length > 0 && (
            <div className="p-4 bg-primary-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">每人应付</span>
                <span className="text-xl font-bold text-primary-600">
                  ¥{equalShare.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                共 {selectedRoommateIds.length} 人分摊 ¥{parseFloat(totalAmount || '0').toFixed(2)}
              </div>
            </div>
          )}

          {splitMode === 'custom' && selectedRoommateIds.length > 0 && (
            <div className="space-y-3">
              {selectedRoommates.map((roommate) => (
                <div key={roommate.id} className="flex items-center gap-3">
                  <span className="text-xl w-8 flex-shrink-0">{roommate.avatar}</span>
                  <span className="text-sm text-gray-700 w-16 flex-shrink-0">{roommate.name}</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      ¥
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customAmounts[roommate.id] || ''}
                      onChange={(e) =>
                        setCustomAmounts((prev) => ({
                          ...prev,
                          [roommate.id]: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none text-gray-800 placeholder-gray-400 text-right"
                    />
                  </div>
                </div>
              ))}
              <div
                className={`flex items-center justify-between p-3 rounded-xl ${
                  Math.abs(customSum - parseFloat(totalAmount || '0')) < 0.01
                    ? 'bg-success-50'
                    : 'bg-warning-50'
                }`}
              >
                <span
                  className={`text-sm ${
                    Math.abs(customSum - parseFloat(totalAmount || '0')) < 0.01
                      ? 'text-success-600'
                      : 'text-warning-600'
                  }`}
                >
                  已分配 / 总金额
                </span>
                <span
                  className={`font-bold ${
                    Math.abs(customSum - parseFloat(totalAmount || '0')) < 0.01
                      ? 'text-success-600'
                      : 'text-warning-600'
                  }`}
                >
                  ¥{customSum.toFixed(2)} / ¥{parseFloat(totalAmount || '0').toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注 <span className="text-gray-400">(选填)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="比如：本月用电量比较多哦"
              rows={2}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors resize-none text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full mt-6 py-4 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          添加账单
        </button>
      </div>
    </div>
  );
}
