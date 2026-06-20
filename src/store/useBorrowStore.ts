import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BorrowRecord, Roommate, BorrowType, FilterType, BorrowStatus, SortType, SortOrder } from '@/types';
import { MOCK_RECORDS, MOCK_ROOMMATES } from '@/data/mockData';
import { isOverdue, isToday } from '@/utils/date';

interface BorrowState {
  records: BorrowRecord[];
  roommates: Roommate[];
  filter: FilterType;
  showHistory: boolean;
  showRoommateModal: boolean;
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

  setFilter: (filter: FilterType) => void;
  toggleHistory: () => void;
  setShowRoommateModal: (show: boolean) => void;
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
      filter: 'all',
      showHistory: false,
      showRoommateModal: false,
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
        set((state) => ({ records: [newRecord, ...state.records] }));
      },

      returnRecord: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id
              ? { ...r, status: 'returned' as const, actualReturnDate: now, updatedAt: now }
              : r
          ),
        }));
      },

      deleteRecord: (id) => {
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

      setFilter: (filter) => set({ filter }),

      toggleHistory: () => set((state) => ({ showHistory: !state.showHistory })),

      setShowRoommateModal: (show) => set({ showRoommateModal: show }),

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
