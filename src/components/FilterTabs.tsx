import { useBorrowStore } from '@/store/useBorrowStore';
import type { FilterType } from '@/types';

const TABS: { key: FilterType; label: string; emoji: string }[] = [
  { key: 'all', label: '全部', emoji: '📋' },
  { key: 'lend', label: '借出', emoji: '📤' },
  { key: 'borrow', label: '借入', emoji: '📥' },
  { key: 'overdue', label: '逾期', emoji: '⏰' },
];

export function FilterTabs() {
  const { filter, setFilter } = useBorrowStore();

  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setFilter(tab.key)}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
            filter === tab.key
              ? 'bg-white text-primary-600 shadow-md scale-105'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>{tab.emoji}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
