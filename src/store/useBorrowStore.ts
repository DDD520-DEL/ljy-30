import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { House, BorrowRecord, Roommate, FilterType, BorrowStatus, SortType, SortOrder, InventoryItem, CompensationRecord, CompensationStatus, Comment } from '@/types';
import { MOCK_HOUSES, MOCK_RECORDS, MOCK_ROOMMATES, MOCK_INVENTORY, DEFAULT_HOUSE_ID } from '@/data/mockData';
import { isOverdue, isToday } from '@/utils/date';

interface BorrowState {
  houses: House[];
  currentHouseId: string;

  records: BorrowRecord[];
  compensationRecords: CompensationRecord[];
  comments: Comment[];
  roommates: Roommate[];
  inventory: InventoryItem[];
  filter: FilterType;
  showHistory: boolean;
  showRoommateModal: boolean;
  showInventoryModal: boolean;
  showHouseModal: boolean;
  searchQuery: string;
  selectedRoommateId: string | null;
  sortType: SortType;
  sortOrder: SortOrder;

  createHouse: (data: { name: string; emoji: string }) => House;
  joinHouse: (inviteCode: string) => House | null;
  switchHouse: (houseId: string) => void;
  deleteHouse: (houseId: string) => void;
  getCurrentHouse: () => House | undefined;
  setShowHouseModal: (show: boolean) => void;

  addRecord: (record: Omit<BorrowRecord, 'id' | 'houseId' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  returnRecord: (id: string, options?: { isDamaged?: boolean; damageDescription?: string; compensationAmount?: number }) => void;
  deleteRecord: (id: string) => void;
  updateRecord: (id: string, updates: Partial<BorrowRecord>) => void;

  addCompensationRecord: (record: Omit<CompensationRecord, 'id' | 'houseId' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateCompensationStatus: (id: string, status: CompensationStatus) => void;
  deleteCompensationRecord: (id: string) => void;
  getCompensationByRecordId: (borrowRecordId: string) => CompensationRecord | undefined;
  getCompensations: () => CompensationRecord[];
  getPendingCompensations: () => CompensationRecord[];

  addComment: (record: Omit<Comment, 'id' | 'houseId' | 'createdAt'>) => void;
  deleteComment: (id: string) => void;
  getCommentsByRecordId: (recordId: string) => Comment[];
  getCommentCountByRecordId: (recordId: string) => number;

  addRoommate: (roommate: Omit<Roommate, 'id' | 'houseId' | 'createdAt'>) => void;
  deleteRoommate: (id: string) => void;
  updateRoommate: (id: string, updates: Partial<Roommate>) => void;

  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'houseId' | 'createdAt' | 'updatedAt' | 'currentQuantity'>) => void;
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

  importRecords: (records: BorrowRecord[]) => { added: number; duplicates: number };
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const HOUSE_EMOJIS = ['🏠', '🏡', '🏘️', '🏢', '🏬', '🏚️', '🏛️', '🏗️'];

export const useBorrowStore = create<BorrowState>()(
  persist(
    (set, get) => ({
      houses: MOCK_HOUSES,
      currentHouseId: DEFAULT_HOUSE_ID,

      records: MOCK_RECORDS,
      compensationRecords: [],
      comments: [],
      roommates: MOCK_ROOMMATES,
      inventory: MOCK_INVENTORY,
      filter: 'all',
      showHistory: false,
      showRoommateModal: false,
      showInventoryModal: false,
      showHouseModal: false,
      searchQuery: '',
      selectedRoommateId: null,
      sortType: 'returnDate',
      sortOrder: 'asc',

      createHouse: (data) => {
        const now = new Date().toISOString();
        const newHouse: House = {
          id: generateId(),
          name: data.name.trim(),
          inviteCode: generateInviteCode(),
          emoji: data.emoji || HOUSE_EMOJIS[Math.floor(Math.random() * HOUSE_EMOJIS.length)],
          createdAt: now,
        };
        set((state) => ({
          houses: [...state.houses, newHouse],
          currentHouseId: newHouse.id,
        }));
        return newHouse;
      },

      joinHouse: (inviteCode) => {
        const trimmedCode = inviteCode.trim().toUpperCase();
        const house = get().houses.find((h) => h.inviteCode === trimmedCode);
        if (house) {
          set({ currentHouseId: house.id });
          return house;
        }
        return null;
      },

      switchHouse: (houseId) => {
        if (get().houses.find((h) => h.id === houseId)) {
          set({
            currentHouseId: houseId,
            selectedRoommateId: null,
            searchQuery: '',
          });
        }
      },

      deleteHouse: (houseId) => {
        const houses = get().houses;
        if (houses.length <= 1) return;

        const newHouses = houses.filter((h) => h.id !== houseId);
        let newCurrentId = get().currentHouseId;
        if (newCurrentId === houseId) {
          newCurrentId = newHouses[0].id;
        }

        set((state) => ({
          houses: newHouses,
          currentHouseId: newCurrentId,
          records: state.records.filter((r) => r.houseId !== houseId),
          compensationRecords: state.compensationRecords.filter((r) => r.houseId !== houseId),
          comments: state.comments.filter((c) => c.houseId !== houseId),
          roommates: state.roommates.filter((r) => r.houseId !== houseId),
          inventory: state.inventory.filter((i) => i.houseId !== houseId),
        }));
      },

      getCurrentHouse: () => {
        return get().houses.find((h) => h.id === get().currentHouseId);
      },

      setShowHouseModal: (show) => set({ showHouseModal: show }),

      addRecord: (record) => {
        const now = new Date().toISOString();
        const status: BorrowStatus = isOverdue(record.expectedReturnDate) ? 'overdue' : 'active';
        const newRecord: BorrowRecord = {
          ...record,
          id: generateId(),
          houseId: get().currentHouseId,
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

      returnRecord: (id, options) => {
        const now = new Date().toISOString();
        const record = get().records.find((r) => r.id === id);

        if (record && record.type === 'lend' && record.itemId) {
          const quantity = record.quantity || 1;
          get().increaseInventory(record.itemId, quantity);
        }

        set((state) => ({
          records: state.records.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'returned' as const,
                  actualReturnDate: now,
                  updatedAt: now,
                  isDamaged: options?.isDamaged,
                  damageDescription: options?.damageDescription,
                }
              : r
          ),
        }));

        if (options?.isDamaged && options?.compensationAmount && options.compensationAmount > 0 && record) {
          get().addCompensationRecord({
            borrowRecordId: id,
            itemName: record.itemName,
            itemEmoji: record.itemEmoji,
            roommateId: record.roommateId,
            roommateName: record.roommateName,
            roommateAvatar: record.roommateAvatar,
            damageDescription: options.damageDescription || '物品损坏',
            amount: options.compensationAmount,
          });
        }
      },

      deleteRecord: (id) => {
        const record = get().records.find((r) => r.id === id);

        if (record && record.status !== 'returned' && record.type === 'lend' && record.itemId) {
          const quantity = record.quantity || 1;
          get().increaseInventory(record.itemId, quantity);
        }

        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
          comments: state.comments.filter((c) => c.recordId !== id),
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

      addCompensationRecord: (record) => {
        const now = new Date().toISOString();
        const newRecord: CompensationRecord = {
          ...record,
          id: generateId(),
          houseId: get().currentHouseId,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ compensationRecords: [newRecord, ...state.compensationRecords] }));
      },

      updateCompensationStatus: (id, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          compensationRecords: state.compensationRecords.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  paidAt: status === 'paid' ? now : undefined,
                  updatedAt: now,
                }
              : r
          ),
        }));
      },

      deleteCompensationRecord: (id) => {
        set((state) => ({
          compensationRecords: state.compensationRecords.filter((r) => r.id !== id),
        }));
      },

      getCompensationByRecordId: (borrowRecordId) => {
        return get().compensationRecords.find((r) => r.borrowRecordId === borrowRecordId);
      },

      getCompensations: () => {
        const houseId = get().currentHouseId;
        return get().compensationRecords.filter((r) => r.houseId === houseId);
      },

      getPendingCompensations: () => {
        const houseId = get().currentHouseId;
        return get().compensationRecords.filter((r) => r.houseId === houseId && r.status === 'pending');
      },

      addComment: (comment) => {
        const now = new Date().toISOString();
        const newComment: Comment = {
          ...comment,
          id: generateId(),
          houseId: get().currentHouseId,
          createdAt: now,
        };
        set((state) => ({ comments: [newComment, ...state.comments] }));
      },

      deleteComment: (id) => {
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== id),
        }));
      },

      getCommentsByRecordId: (recordId) => {
        const houseId = get().currentHouseId;
        return get()
          .comments.filter((c) => c.houseId === houseId && c.recordId === recordId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getCommentCountByRecordId: (recordId) => {
        const houseId = get().currentHouseId;
        return get().comments.filter((c) => c.houseId === houseId && c.recordId === recordId).length;
      },

      addRoommate: (roommate) => {
        const now = new Date().toISOString();
        const newRoommate: Roommate = {
          ...roommate,
          id: generateId(),
          houseId: get().currentHouseId,
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
          houseId: get().currentHouseId,
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
        const houseId = get().currentHouseId;
        return get().inventory.find((i) => i.id === id && i.houseId === houseId);
      },

      getInventoryItemByName: (name) => {
        const houseId = get().currentHouseId;
        return get().inventory.find((i) => i.name === name && i.houseId === houseId);
      },

      getLowStockItems: () => {
        const houseId = get().currentHouseId;
        return get().inventory.filter((i) => i.houseId === houseId && i.currentQuantity <= i.threshold);
      },

      getInventoryStats: () => {
        const houseId = get().currentHouseId;
        const inventory = get().inventory.filter((i) => i.houseId === houseId);
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
        const houseId = get().currentHouseId;
        set((state) => ({
          records: state.records.map((r) => {
            if (r.houseId === houseId && r.status === 'active' && isOverdue(r.expectedReturnDate)) {
              return { ...r, status: 'overdue' as const, updatedAt: new Date().toISOString() };
            }
            return r;
          }),
        }));
      },

      getActiveRecords: () => {
        const houseId = get().currentHouseId;
        return get().records.filter((r) => r.houseId === houseId && r.status !== 'returned');
      },

      getHistoryRecords: () => {
        const houseId = get().currentHouseId;
        return get().records.filter((r) => r.houseId === houseId && r.status === 'returned');
      },

      getFilteredRecords: () => {
        const { records, filter } = get();
        const houseId = get().currentHouseId;
        const active = records.filter((r) => r.houseId === houseId && r.status !== 'returned');
        
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
        const houseId = get().currentHouseId;
        const records = get().records.filter((r) => r.houseId === houseId);
        const active = records.filter((r) => r.status !== 'returned');
        const lend = active.filter((r) => r.type === 'lend').length;
        const borrow = active.filter((r) => r.type === 'borrow').length;
        const overdue = active.filter((r) => isOverdue(r.expectedReturnDate)).length;
        const todayDue = active.filter((r) => isToday(r.expectedReturnDate)).length;
        return { lend, borrow, overdue, todayDue };
      },

      getDueReminders: () => {
        const houseId = get().currentHouseId;
        const records = get().records.filter((r) => r.houseId === houseId);
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
        const houseId = get().currentHouseId;
        let active = records.filter((r) => r.houseId === houseId && r.status !== 'returned');

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
        const houseId = get().currentHouseId;
        let history = records.filter((r) => r.houseId === houseId && r.status === 'returned');

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

      importRecords: (importedRecords) => {
        const houseId = get().currentHouseId;
        const existingRecords = get().records.filter((r) => r.houseId === houseId);

        const makeKey = (r: BorrowRecord) =>
          `${r.itemName}|${r.roommateId}|${r.borrowDate}|${r.expectedReturnDate}|${r.actualReturnDate || ''}`;

        const existingKeys = new Set(existingRecords.map(makeKey));

        let added = 0;
        let duplicates = 0;
        const newRecords: BorrowRecord[] = [];

        importedRecords.forEach((record) => {
          const key = makeKey(record);
          if (existingKeys.has(key)) {
            duplicates++;
          } else {
            const now = new Date().toISOString();
            const newRecord: BorrowRecord = {
              ...record,
              id: generateId(),
              houseId,
              createdAt: record.createdAt || now,
              updatedAt: now,
            };
            newRecords.push(newRecord);
            existingKeys.add(key);
            added++;
          }
        });

        if (newRecords.length > 0) {
          set((state) => ({
            records: [...newRecords, ...state.records],
          }));
        }

        return { added, duplicates };
      },
    }),
    {
      name: 'borrow-tracker-storage',
    }
  )
);
