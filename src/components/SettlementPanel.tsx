import { useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { ArrowRight, Wallet, Sparkles } from 'lucide-react';

export function SettlementPanel() {
  const { calculateSettlements, getBillStats, roommates, currentHouseId } = useBorrowStore();

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );

  const settlements = calculateSettlements();
  const stats = getBillStats();

  if (settlements.length === 0 && stats.pendingAmount === 0) {
    return (
      <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-success-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-success-700 text-lg">🎉 太棒了！</h3>
            <p className="text-sm text-success-600">所有账单都已结清，没有待结算的款项</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-warning-50 to-orange-50 rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-warning-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">结算建议</h3>
            <p className="text-sm text-gray-500">
              待结算总额：<span className="font-bold text-warning-600">¥{stats.pendingAmount.toFixed(2)}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-warning-600">{settlements.length}</div>
          <div className="text-xs text-gray-500">笔转账</div>
        </div>
      </div>

      {currentRoommates.length < 2 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          至少需要 2 位室友才能计算结算方案
        </div>
      ) : settlements.length === 0 ? (
        <div className="text-center py-4 text-success-600 text-sm font-medium">
          ✨ 账目已平，无需转账
        </div>
      ) : (
        <div className="space-y-2">
          {settlements.map((s, index) => (
            <div
              key={`${s.fromRoommateId}-${s.toRoommateId}-${index}`}
              className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{s.fromRoommateAvatar}</span>
                <span className="font-medium text-gray-800">{s.fromRoommateName}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-warning-600 text-lg">¥{s.amount.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{s.toRoommateAvatar}</span>
                <span className="font-medium text-gray-800">{s.toRoommateName}</span>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 text-center mt-2">
            💡 以上为最优结算方案，可减少转账次数
          </p>
        </div>
      )}
    </div>
  );
}
