import { useBorrowStore } from '@/store/useBorrowStore';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface LowStockBannerProps {
  onViewInventory?: () => void;
}

export function LowStockBanner({ onViewInventory }: LowStockBannerProps) {
  const { getLowStockItems, setShowInventoryModal } = useBorrowStore();
  const lowStockItems = getLowStockItems();

  if (lowStockItems.length === 0) return null;

  const handleClick = () => {
    setShowInventoryModal(true);
    onViewInventory?.();
  };

  return (
    <div
      onClick={handleClick}
      className="mx-5 mt-4 mb-2 bg-gradient-to-r from-warning-400 to-warning-500 rounded-2xl p-4 shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <span>⚠️ 补货提醒</span>
          </h3>
          <p className="text-white/90 text-sm mt-0.5">
            有 {lowStockItems.length} 件物品库存不足
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-white/80" />
      </div>

      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {lowStockItems.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2"
          >
            <span className="text-xl">{item.emoji}</span>
            <div>
              <span className="text-white text-xs font-medium block">{item.name}</span>
              <span className="text-white/80 text-xs">
                剩 {item.currentQuantity}{item.unit} / 阈值 {item.threshold}{item.unit}
              </span>
            </div>
          </div>
        ))}
        {lowStockItems.length > 4 && (
          <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center justify-center">
            <span className="text-white text-xs">+{lowStockItems.length - 4} 件</span>
          </div>
        )}
      </div>
    </div>
  );
}
