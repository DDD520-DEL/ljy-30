import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BorrowRecord, Roommate, BorrowType, FilterType, BorrowStatus, SortType, SortOrder, InventoryItem } from '@/types';
import { MOCK_RECORDS, MOCK_ROOMMATES, MOCK_INVENTORY } from '@/data/mockData';
import { isOverdue, isToday } from '@/utils/date';

interface BorrowState {
  records: BorrowRecord[];
  roommates: Roommate[];
  inventory: InventoryItem[];
  filter: FilterType;
  showHistory: boolean;
  showRoommateModal: boolean;
  showInventoryModal: boolean;
  searchQuery: string;
  selectedRoommateId: string | null;
  sortType: SortType;
  sortOrder: SortOrder;

  addRecord: (record: Omit<BorrowRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  returnRecord: (id: string) => void;
  deleteRecord: (id: string) => void;
  updateRecord: (id: string, updates: Partial<BorrowRecord>) => void;

  addRoommate: (roommate: Omit<Roommate, 'id' | 'createdAt'>) => void;
  deleteRoommate: (id: string) => void;
  updateRoommate: (id: string, updates: Partial<Roommate>) => void;

  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'currentQuantity'>) => void;
  deleteInventoryItem: (id: string) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  decreaseInventory: (itemId: string, quantity: number) => boolean;
  increaseInventory: (itemId: string, quantity: number) => void;
  restockInventory: (itemId: string, amount: number) => void;
  getInventoryItemById: (id: string) => InventoryItem | undefined;
  getInventoryItemByName: (name: string) => InventoryItem | undefined;
  getLowStockItems: () => InventoryItem[];
  getInventoryStats: () => { total: number; lowStock: number; consumables: number };

  setFilter: (filter: FilterType) => void;
  toggleHistory: () => void;
  setShowRoommateModal: (show: boolean) => void;
  setShowInventoryModal: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedRoommateId: (id: string | null) => void;
  setSortType: (type: SortType) => void;
  setSortOrder: (order: SortOrder) => void;

  checkOverdue: () => void;

  getActiveRecords: () => BorrowRecord[];
  getHistoryRecords: () => BorrowRecord[];
  getFilteredRecords: () => BorrowRecord[];
  getSearchFilteredRecords: () => BorrowRecord[];
  getSearchFilteredHistoryRecords: () => BorrowRecord[];
  getStats: () => { lend: number; borrow: number; overdue: number; todayDue: number };
  getDueReminders: () => BorrowRecord[];
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useBorrowStore = create<BorrowState>()(
  persist(
    (set, get) => ({
      records: MOCK_RECORDS,
      roommates: MOCK_ROOMMATES,
      inventory: MOCK_INVENTORY,
      filter: 'all',
      showHistory: false,
      showRoommateModal: false,
      showInventoryModal: false,
      searchQuery: '',
      selectedRoommateId: null,
      sortType: 'returnDate',
      sortOrder: 'asc',

      addRecord: (record) => {
        const now = new Date().toISOString();
        const status: BorrowStatus = isOverdue(record.expectedReturnDate) ? 'overdue' : 'active';
        const newRecord: BorrowRecord = {
          ...record,
          id: generateId(),
          status,
          createdAt: now,
          updatedAt: now,
        };

        if (record.type === 'lend' && record.itemId) {
          const quantity = record.quantity || 1;
          get().decreaseInventory(record.itemId, quantity);
        }

        set((state) => ({ records: [newRecord, ...state.records] }));
      },

      returnRecord: (id) => {
        const now = new Date().toISOString();
        const record = get().records.find((r) => r.id === id);

        if (record && record.type === 'lend' && record.itemId) {
          const quantity = record.quantity || 1;
          get().increaseInventory(record.itemId, quantity);
        }

        set((state) => ({
          records: state.records.map((r) =>
            r.id === id
              ? { ...r, status: 'returned' as const, actualReturnDate: now, updatedAt: now }
              : r
          ),
        }));
      },

      deleteRecord: (id) => {
        const record = get().records.find((r) => r.id === id);

        if (record && record.status !== 'returned' && record.type === 'lend' && record.itemId) {
          const quantity = record.quantity || 1;
          get().increaseInventory(record.itemId, quantity);
        }

        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }));
      },

      updateRecord: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: now } : r
          ),
        }));
      },

      addRoommate: (roommate) => {
        const now = new Date().toISOString();
        const newRoommate: Roommate = {
          ...roommate,
          id: generateId(),
          createdAt: now,
        };
        set((state) => ({ roommates: [...state.roommates, newRoommate] }));
      },

      deleteRoommate: (id) => {
        set((state) => ({
          roommates: state.roommates.filter((r) => r.id !== id),
        }));
      },

      updateRoommate: (id, updates) => {
        set((state) => ({
          roommates: state.roommates.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      addInventoryItem: (item) => {
        const now = new Date().toISOString();
        const safeTotalQuantity = Math.max(0, item.totalQuantity);
        const safeThreshold = Math.max(0, Math.min(item.threshold, safeTotalQuantity));
        const newItem: InventoryItem = {
          ...item,
          id: generateId(),
          totalQuantity: safeTotalQuantity,
          currentQuantity: safeTotalQuantity,
          threshold: safeThreshold,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ inventory: [...state.inventory, newItem] }));
      },

      deleteInventoryItem: (id) => {
        set((state) => ({
          inventory: state.inventory.filter((i) => i.id !== id),
        }));
      },

      updateInventoryItem: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          inventory: state.inventory.map((i) => {
            if (i.id !== id) return i;

            const merged = { ...i, ...updates };
            const safeTotalQuantity = Math.max(0, merged.totalQuantity);
            const safeCurrentQuantity = Math.max(0, Math.min(merged.currentQuantity, safeTotalQuantity));
            const safeThreshold = Math.max(0, Math.min(merged.threshold, safeTotalQuantity));

            return {
              ...i,
              ...updates,
              totalQuantity: safeTotalQuantity,
              currentQuantity: safeCurrentQuantity,
              threshold: safeThreshold,
              updatedAt: now,
            };
          }),
        }));
      },

      decreaseInventory: (itemId, quantity) => {
        const item = get().inventory.find((i) => i.id === itemId);
        if (!item || item.currentQuantity < quantity) {
          return false;
        }
        const now = new Date().toISOString();
        const safeQuantity = Math.max(0, Math.min(quantity, item.currentQuantity));
        set((state) => ({
          inventory: state.inventory.map((i) =>
            i.id === itemId
              ? { ...i, currentQuantity: i.currentQuantity - safeQuantity, updatedAt: now }
              : i
          ),
        }));
        return true;
      },

      increaseInventory: (itemId, quantity) => {
        const now = new Date().toISOString();
        const safeQuantity = Math.max(0, quantity);
        set((state) => ({
          inventory: state.inventory.map((i) => {
            if (i.id !== itemId) return i;
            const newCurrent = Math.min(i.currentQuantity + safeQuantity, i.totalQuantity);
            return { ...i, currentQuantity: Math.max(0, newCurrent), updatedAt: now };
          }),
        }));
      },

      restockInventory: (itemId, amount) => {
        const now = new Date().toISOString();
        set((state) => ({
          inventory: state.inventory.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  currentQuantity: i.currentQuantity + amount,
                  totalQuantity: i.totalQuantity + amount,
                  updatedAt: now,
                }
              : i
          ),
        }));
      },

      getInventoryItemById: (id) => {
        return get().inventory.find((i) => i.id === id);
      },

      getInventoryItemByName: (name) => {
        return get().inventory.find((i) => i.name === name);
      },

      getLowStockItems: () => {
        return get().inventory.filter((i) => i.currentQuantity <= i.threshold);
      },

      getInventoryStats: () => {
        const inventory = get().inventory;
        const total = inventory.length;
        const lowStock = inventory.filter((i) => i.currentQuantity <= i.threshold).length;
        const consumables = inventory.filter((i) => i.isConsumable).length;
        return { total, lowStock, consumables };
      },

      setFilter: (filter) => set({ filter }),

      toggleHistory: () => set((state) => ({ showHistory: !state.showHistory })),

      setShowRoommateModal: (show) => set({ showRoommateModal: show }),

      setShowInventoryModal: (show) => set({ showInventoryModal: show }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      setSelectedRoommateId: (selectedRoommateId) => set({ selectedRoommateId }),

      setSortType: (sortType) => set({ sortType }),

      setSortOrder: (sortOrder) => set({ sortOrder }),

      checkOverdue: () => {
        set((state) => ({
          records: state.records.map((r) => {
            if (r.status === 'active' && isOverdue(r.expectedReturnDate)) {
              return { ...r, status: 'overdue' as const, updatedAt: new Date().toISOString() };
            }
            return r;
          }),
        }));
      },

      getActiveRecords: () => {
        return get().records.filter((r) => r.status !== 'returned');
      },

      getHistoryRecords: () => {
        return get().records.filter((r) => r.status === 'returned');
      },

      getFilteredRecords: () => {
        const { records, filter } = get();
        const active = records.filter((r) => r.status !== 'returned');
        
        switch (filter) {
          case 'lend':
            return active.filter((r) => r.type === 'lend');
          case 'borrow':
            return active.filter((r) => r.type === 'borrow');
          case 'overdue':
            return active.filter((r) => isOverdue(r.expectedReturnDate));
          default:
            return active;
        }
      },

      getStats: () => {
        const records = get().records;
        const active = records.filter((r) => r.status !== 'returned');
        const lend = active.filter((r) => r.type === 'lend').length;
        const borrow = active.filter((r) => r.type === 'borrow').length;
        const overdue = active.filter((r) => isOverdue(r.expectedReturnDate)).length;
        const todayDue = active.filter((r) => isToday(r.expectedReturnDate)).length;
        return { lend, borrow, overdue, todayDue };
      },

      getDueReminders: () => {
        const records = get().records;
        const active = records.filter((r) => r.status !== 'returned');
        const reminders = active.filter((r) => {
          return isToday(r.expectedReturnDate) || isOverdue(r.expectedReturnDate);
        });
        return reminders.sort((a, b) => {
          const aOverdue = isOverdue(a.expectedReturnDate);
          const bOverdue = isOverdue(b.expectedReturnDate);
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          return new Date(a.expectedReturnDate).getTime() - new Date(b.expectedReturnDate).getTime();
        });
      },

      getSearchFilteredRecords: () => {
        const { records, filter, searchQuery, selectedRoommateId, sortType, sortOrder } = get();
        let active = records.filter((r) => r.status !== 'returned');

        switch (filter) {
          case 'lend':
            active = active.filter((r) => r.type === 'lend');
            break;
          case 'borrow':
            active = active.filter((r) => r.type === 'borrow');
            break;
          case 'overdue':
            active = active.filter((r) => isOverdue(r.expectedReturnDate));
            break;
          default:
            break;
        }

        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase();
          active = active.filter((r) =>
            r.itemName.toLowerCase().includes(query)
          );
        }

        if (selectedRoommateId) {
          active = active.filter((r) => r.roommateId === selectedRoommateId);
        }

        const sorted = [...active].sort((a, b) => {
          let comparison = 0;
          if (sortType === 'returnDate') {
            comparison = new Date(a.expectedReturnDate).getTime() - new Date(b.expectedReturnDate).getTime();
          } else if (sortType === 'createdAt') {
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          return sortOrder === 'asc' ? comparison : -comparison;
        });

        return sorted;
      },

      getSearchFilteredHistoryRecords: () => {
        const { records, searchQuery, selectedRoommateId, sortType, sortOrder } = get();
        let history = records.filter((r) => r.status === 'returned');

        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase();
          history = history.filter((r) =>
            r.itemName.toLowerCase().includes(query)
          );
        }

        if (selectedRoommateId) {
          history = history.filter((r) => r.roommateId === selectedRoommateId);
        }

        const sorted = [...history].sort((a, b) => {
          let comparison = 0;
          if (sortType === 'returnDate') {
            const aDate = a.actualReturnDate || a.expectedReturnDate;
            const bDate = b.actualReturnDate || b.expectedReturnDate;
            comparison = new Date(aDate).getTime() - new Date(bDate).getTime();
          } else if (sortType === 'createdAt') {
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          return sortOrder === 'asc' ? comparison : -comparison;
        });

        return sorted;
      },
    }),
    {
      name: 'borrow-tracker-storage',
    }
  )
);
