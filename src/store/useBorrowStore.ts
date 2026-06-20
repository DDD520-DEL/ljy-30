import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BorrowRecord, Roommate, BorrowType, FilterType, BorrowStatus } from '@/types';
import { MOCK_RECORDS, MOCK_ROOMMATES } from '@/data/mockData';
import { isOverdue } from '@/utils/date';

interface BorrowState {
  records: BorrowRecord[];
  roommates: Roommate[];
  filter: FilterType;
  showHistory: boolean;
  showRoommateModal: boolean;

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

  checkOverdue: () => void;

  getActiveRecords: () => BorrowRecord[];
  getHistoryRecords: () => BorrowRecord[];
  getFilteredRecords: () => BorrowRecord[];
  getStats: () => { lend: number; borrow: number; overdue: number; todayDue: number };
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
            return active.filter((r) => r.status === 'overdue');
          default:
            return active;
        }
      },

      getStats: () => {
        const records = get().records;
        const active = records.filter((r) => r.status !== 'returned');
        const lend = active.filter((r) => r.type === 'lend').length;
        const borrow = active.filter((r) => r.type === 'borrow').length;
        const overdue = active.filter((r) => r.status === 'overdue').length;
        const todayDue = active.filter((r) => {
          const due = new Date(r.expectedReturnDate);
          const today = new Date();
          return (
            due.getFullYear() === today.getFullYear() &&
            due.getMonth() === today.getMonth() &&
            due.getDate() === today.getDate()
          );
        }).length;
        return { lend, borrow, overdue, todayDue };
      },
    }),
    {
      name: 'borrow-tracker-storage',
    }
  )
);
