import { useState } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { ChevronDown, Plus, Home as HomeIcon } from 'lucide-react';

interface HouseSwitcherProps {
  onManageClick: () => void;
}

export function HouseSwitcher({ onManageClick }: HouseSwitcherProps) {
  const { houses, currentHouseId, switchHouse, getCurrentHouse } = useBorrowStore();
  const [isOpen, setIsOpen] = useState(false);
  const currentHouse = getCurrentHouse();

  if (!currentHouse) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-2xl transition-all active:scale-[0.98]"
      >
        <span className="text-2xl">{currentHouse.emoji}</span>
        <div className="text-left">
          <div className="text-sm font-bold text-white leading-tight">
            {currentHouse.name}
          </div>
          <div className="text-xs text-white/70 leading-tight">
            邀请码: {currentHouse.inviteCode}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="max-h-72 overflow-y-auto">
              {houses.map((house) => (
                <button
                  key={house.id}
                  onClick={() => {
                    switchHouse(house.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    house.id === currentHouseId
                      ? 'bg-primary-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                    {house.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${
                      house.id === currentHouseId ? 'text-primary-600' : 'text-gray-800'
                    }`}>
                      {house.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      邀请码: {house.inviteCode}
                    </div>
                  </div>
                  {house.id === currentHouseId && (
                    <HomeIcon className="w-4 h-4 text-primary-500" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onManageClick();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-primary-600 hover:bg-primary-50 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>管理房屋</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
