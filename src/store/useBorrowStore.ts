import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { House, BorrowRecord, Roommate, FilterType, BorrowStatus, SortType, SortOrder, InventoryItem, CompensationRecord, CompensationStatus, Comment, BorrowTemplate, Bill, BillStatus, Settlement, ChoreTask, ChoreAssignment, ChoreRotation, DayOfWeek } from '@/types';
import { MOCK_HOUSES, MOCK_RECORDS, MOCK_ROOMMATES, MOCK_INVENTORY, DEFAULT_HOUSE_ID, MOCK_CHORE_TASKS, MOCK_CHORE_ASSIGNMENTS, MOCK_CHORE_ROTATIONS } from '@/data/mockData';
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

  templates: BorrowTemplate[];
  addTemplate: (template: Omit<BorrowTemplate, 'id' | 'houseId' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, updates: Partial<Omit<BorrowTemplate, 'id' | 'houseId' | 'createdAt'>>) => void;
  deleteTemplate: (id: string) => void;
  getTemplates: () => BorrowTemplate[];

  bills: Bill[];
  billFilter: BillStatus | 'all';
  setBillFilter: (filter: BillStatus | 'all') => void;
  addBill: (bill: Omit<Bill, 'id' | 'houseId' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  deleteBill: (id: string) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  markBillParticipantPaid: (billId: string, roommateId: string) => void;
  getBills: () => Bill[];
  getFilteredBills: () => Bill[];
  getPendingBills: () => Bill[];
  getSettledBills: () => Bill[];
  getBillStats: () => { total: number; pending: number; settled: number; totalAmount: number; pendingAmount: number };
  calculateSettlements: () => Settlement[];

  choreTasks: ChoreTask[];
  choreAssignments: ChoreAssignment[];
  choreRotations: ChoreRotation[];
  showChoreTaskModal: boolean;
  showChoreAssignModal: boolean;
  selectedChoreTask: ChoreTask | null;
  selectedChoreDay: DayOfWeek | null;

  setShowChoreTaskModal: (show: boolean) => void;
  setShowChoreAssignModal: (show: boolean) => void;
  setSelectedChoreTask: (task: ChoreTask | null) => void;
  setSelectedChoreDay: (day: DayOfWeek | null) => void;

  addChoreTask: (task: Omit<ChoreTask, 'id' | 'houseId' | 'createdAt' | 'updatedAt'>) => void;
  deleteChoreTask: (id: string) => void;
  updateChoreTask: (id: string, updates: Partial<ChoreTask>) => void;
  getChoreTasks: () => ChoreTask[];

  addChoreAssignment: (assignment: Omit<ChoreAssignment, 'id' | 'houseId' | 'createdAt' | 'updatedAt'>) => void;
  deleteChoreAssignment: (id: string) => void;
  updateChoreAssignment: (id: string, updates: Partial<ChoreAssignment>) => void;
  getChoreAssignments: () => ChoreAssignment[];
  getChoreAssignmentsByTask: (taskId: string) => ChoreAssignment[];
  getChoreAssignmentsByDay: (dayOfWeek: DayOfWeek) => ChoreAssignment[];
  getTodayChoreAssignments: () => ChoreAssignment[];

  addChoreRotation: (rotation: Omit<ChoreRotation, 'id' | 'houseId' | 'createdAt' | 'updatedAt' | 'currentOffset'>) => void;
  deleteChoreRotation: (id: string) => void;
  updateChoreRotation: (id: string, updates: Partial<ChoreRotation>) => void;
  getChoreRotations: () => ChoreRotation[];
  toggleChoreRotation: (taskId: string) => void;
  rotateChores: () => void;
  getChoreStats: () => { totalTasks: number; totalAssignments: number; todayAssignments: number; activeRotations: number };
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
      templates: [],
      bills: [],
      billFilter: 'all',
      choreTasks: MOCK_CHORE_TASKS,
      choreAssignments: MOCK_CHORE_ASSIGNMENTS,
      choreRotations: MOCK_CHORE_ROTATIONS,
      showChoreTaskModal: false,
      showChoreAssignModal: false,
      selectedChoreTask: null,
      selectedChoreDay: null,
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
          templates: state.templates.filter((t) => t.houseId !== houseId),
          bills: state.bills.filter((b) => b.houseId !== houseId),
          choreTasks: state.choreTasks.filter((t) => t.houseId !== houseId),
          choreAssignments: state.choreAssignments.filter((a) => a.houseId !== houseId),
          choreRotations: state.choreRotations.filter((r) => r.houseId !== houseId),
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

      addTemplate: (template) => {
        const now = new Date().toISOString();
        const newTemplate: BorrowTemplate = {
          ...template,
          id: generateId(),
          houseId: get().currentHouseId,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ templates: [...state.templates, newTemplate] }));
      },

      updateTemplate: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: now } : t
          ),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      getTemplates: () => {
        const houseId = get().currentHouseId;
        return get().templates.filter((t) => t.houseId === houseId);
      },

      setBillFilter: (filter) => set({ billFilter: filter }),

      addBill: (bill) => {
        const now = new Date().toISOString();
        const allPaid = bill.participants.every((p) => p.paid);
        const newBill: Bill = {
          ...bill,
          id: generateId(),
          houseId: get().currentHouseId,
          status: allPaid ? 'settled' : 'pending',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ bills: [newBill, ...state.bills] }));
      },

      deleteBill: (id) => {
        set((state) => ({
          bills: state.bills.filter((b) => b.id !== id),
        }));
      },

      updateBill: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          bills: state.bills.map((b) => {
            if (b.id !== id) return b;
            const merged = { ...b, ...updates, updatedAt: now };
            if (merged.participants) {
              const allPaid = merged.participants.every((p) => p.paid);
              merged.status = allPaid ? 'settled' : 'pending';
            }
            return merged;
          }),
        }));
      },

      markBillParticipantPaid: (billId, roommateId) => {
        const now = new Date().toISOString();
        set((state) => ({
          bills: state.bills.map((b) => {
            if (b.id !== billId) return b;
            const updatedParticipants = b.participants.map((p) =>
              p.roommateId === roommateId ? { ...p, paid: true, paidAt: now } : p
            );
            const allPaid = updatedParticipants.every((p) => p.paid);
            return {
              ...b,
              participants: updatedParticipants,
              status: allPaid ? 'settled' : 'pending',
              updatedAt: now,
            };
          }),
        }));
      },

      getBills: () => {
        const houseId = get().currentHouseId;
        return get().bills.filter((b) => b.houseId === houseId);
      },

      getFilteredBills: () => {
        const { bills, billFilter } = get();
        const houseId = get().currentHouseId;
        const houseBills = bills.filter((b) => b.houseId === houseId);
        switch (billFilter) {
          case 'pending':
            return houseBills.filter((b) => b.status === 'pending');
          case 'settled':
            return houseBills.filter((b) => b.status === 'settled');
          default:
            return houseBills;
        }
      },

      getPendingBills: () => {
        const houseId = get().currentHouseId;
        return get().bills.filter((b) => b.houseId === houseId && b.status === 'pending');
      },

      getSettledBills: () => {
        const houseId = get().currentHouseId;
        return get().bills.filter((b) => b.houseId === houseId && b.status === 'settled');
      },

      getBillStats: () => {
        const houseId = get().currentHouseId;
        const houseBills = get().bills.filter((b) => b.houseId === houseId);
        const pending = houseBills.filter((b) => b.status === 'pending');
        const settled = houseBills.filter((b) => b.status === 'settled');
        const totalAmount = houseBills.reduce((sum, b) => sum + b.totalAmount, 0);
        const pendingAmount = pending.reduce((sum, b) => {
          const unpaid = b.participants.filter((p) => !p.paid);
          return sum + unpaid.reduce((s, p) => s + p.amount, 0);
        }, 0);
        return {
          total: houseBills.length,
          pending: pending.length,
          settled: settled.length,
          totalAmount,
          pendingAmount,
        };
      },

      calculateSettlements: () => {
        const houseId = get().currentHouseId;
        const { roommates, bills } = get();
        const houseRoommates = roommates.filter((r) => r.houseId === houseId);
        const houseBills = bills.filter((b) => b.houseId === houseId && b.status === 'pending');

        const balances: Record<string, number> = {};
        houseRoommates.forEach((r) => (balances[r.id] = 0));

        houseBills.forEach((bill) => {
          balances[bill.payerId] = (balances[bill.payerId] || 0) + bill.totalAmount;
          bill.participants.forEach((p) => {
            if (!p.paid) {
              balances[p.roommateId] = (balances[p.roommateId] || 0) - p.amount;
            }
          });
        });

        const debtors: { id: string; name: string; avatar: string; amount: number }[] = [];
        const creditors: { id: string; name: string; avatar: string; amount: number }[] = [];

        Object.entries(balances).forEach(([id, amount]) => {
          const roommate = houseRoommates.find((r) => r.id === id);
          if (!roommate) return;
          if (amount < -0.01) {
            debtors.push({ id, name: roommate.name, avatar: roommate.avatar, amount: -amount });
          } else if (amount > 0.01) {
            creditors.push({ id, name: roommate.name, avatar: roommate.avatar, amount });
          }
        });

        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const settlements: Settlement[] = [];
        let i = 0;
        let j = 0;

        while (i < debtors.length && j < creditors.length) {
          const debtor = debtors[i];
          const creditor = creditors[j];
          const amount = Math.min(debtor.amount, creditor.amount);

          if (amount > 0.01) {
            settlements.push({
              fromRoommateId: debtor.id,
              fromRoommateName: debtor.name,
              fromRoommateAvatar: debtor.avatar,
              toRoommateId: creditor.id,
              toRoommateName: creditor.name,
              toRoommateAvatar: creditor.avatar,
              amount: Math.round(amount * 100) / 100,
            });
          }

          debtor.amount -= amount;
          creditor.amount -= amount;

          if (debtor.amount < 0.01) i++;
          if (creditor.amount < 0.01) j++;
        }

        return settlements;
      },

      setShowChoreTaskModal: (show) => set({ showChoreTaskModal: show }),
      setShowChoreAssignModal: (show) => set({ showChoreAssignModal: show }),
      setSelectedChoreTask: (task) => set({ selectedChoreTask: task }),
      setSelectedChoreDay: (day) => set({ selectedChoreDay: day }),

      addChoreTask: (task) => {
        const now = new Date().toISOString();
        const newTask: ChoreTask = {
          ...task,
          id: generateId(),
          houseId: get().currentHouseId,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ choreTasks: [...state.choreTasks, newTask] }));
      },

      deleteChoreTask: (id) => {
        set((state) => ({
          choreTasks: state.choreTasks.filter((t) => t.id !== id),
          choreAssignments: state.choreAssignments.filter((a) => a.taskId !== id),
          choreRotations: state.choreRotations.filter((r) => r.taskId !== id),
        }));
      },

      updateChoreTask: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          choreTasks: state.choreTasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: now } : t
          ),
        }));
      },

      getChoreTasks: () => {
        const houseId = get().currentHouseId;
        return get().choreTasks.filter((t) => t.houseId === houseId);
      },

      addChoreAssignment: (assignment) => {
        const now = new Date().toISOString();
        const newAssignment: ChoreAssignment = {
          ...assignment,
          id: generateId(),
          houseId: get().currentHouseId,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ choreAssignments: [...state.choreAssignments, newAssignment] }));
      },

      deleteChoreAssignment: (id) => {
        set((state) => ({
          choreAssignments: state.choreAssignments.filter((a) => a.id !== id),
        }));
      },

      updateChoreAssignment: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          choreAssignments: state.choreAssignments.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: now } : a
          ),
        }));
      },

      getChoreAssignments: () => {
        const houseId = get().currentHouseId;
        return get().choreAssignments.filter((a) => a.houseId === houseId);
      },

      getChoreAssignmentsByTask: (taskId) => {
        const houseId = get().currentHouseId;
        return get().choreAssignments.filter((a) => a.houseId === houseId && a.taskId === taskId);
      },

      getChoreAssignmentsByDay: (dayOfWeek) => {
        const houseId = get().currentHouseId;
        return get().choreAssignments.filter((a) => a.houseId === houseId && a.dayOfWeek === dayOfWeek);
      },

      getTodayChoreAssignments: () => {
        const today = new Date().getDay() as DayOfWeek;
        return get().getChoreAssignmentsByDay(today);
      },

      addChoreRotation: (rotation) => {
        const now = new Date().toISOString();
        const newRotation: ChoreRotation = {
          ...rotation,
          id: generateId(),
          houseId: get().currentHouseId,
          currentOffset: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ choreRotations: [...state.choreRotations, newRotation] }));
      },

      deleteChoreRotation: (id) => {
        set((state) => ({
          choreRotations: state.choreRotations.filter((r) => r.id !== id),
        }));
      },

      updateChoreRotation: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          choreRotations: state.choreRotations.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: now } : r
          ),
        }));
      },

      getChoreRotations: () => {
        const houseId = get().currentHouseId;
        return get().choreRotations.filter((r) => r.houseId === houseId);
      },

      toggleChoreRotation: (taskId) => {
        const houseId = get().currentHouseId;
        const now = new Date().toISOString();
        set((state) => {
          const rotation = state.choreRotations.find((r) => r.houseId === houseId && r.taskId === taskId);
          if (rotation) {
            return {
              choreRotations: state.choreRotations.map((r) =>
                r.id === rotation.id ? { ...r, enabled: !r.enabled, updatedAt: now } : r
              ),
            };
          } else {
            const newRotation: ChoreRotation = {
              id: generateId(),
              houseId,
              taskId,
              enabled: true,
              startDate: now,
              currentOffset: 0,
              createdAt: now,
              updatedAt: now,
            };
            return {
              choreRotations: [...state.choreRotations, newRotation],
            };
          }
        });
      },

      rotateChores: () => {
        const houseId = get().currentHouseId;
        const { roommates, choreAssignments, choreRotations } = get();
        const houseRoommates = roommates.filter((r) => r.houseId === houseId);
        if (houseRoommates.length === 0) return;

        const now = new Date().toISOString();
        const activeRotations = choreRotations.filter((r) => r.houseId === houseId && r.enabled);

        set((state) => {
          const updatedAssignments = [...state.choreAssignments];
          const updatedRotations = [...state.choreRotations];

          activeRotations.forEach((rotation) => {
            const taskAssignments = updatedAssignments.filter(
              (a) => a.houseId === houseId && a.taskId === rotation.taskId
            );

            taskAssignments.forEach((assignment) => {
              const currentIndex = houseRoommates.findIndex((r) => r.id === assignment.roommateId);
              const nextIndex = (currentIndex + 1) % houseRoommates.length;
              const nextRoommate = houseRoommates[nextIndex];

              const assignmentIndex = updatedAssignments.findIndex((a) => a.id === assignment.id);
              if (assignmentIndex !== -1) {
                updatedAssignments[assignmentIndex] = {
                  ...updatedAssignments[assignmentIndex],
                  roommateId: nextRoommate.id,
                  roommateName: nextRoommate.name,
                  roommateAvatar: nextRoommate.avatar,
                  roommateColor: nextRoommate.color,
                  updatedAt: now,
                };
              }
            });

            const rotationIndex = updatedRotations.findIndex((r) => r.id === rotation.id);
            if (rotationIndex !== -1) {
              updatedRotations[rotationIndex] = {
                ...updatedRotations[rotationIndex],
                currentOffset: updatedRotations[rotationIndex].currentOffset + 1,
                updatedAt: now,
              };
            }
          });

          return {
            choreAssignments: updatedAssignments,
            choreRotations: updatedRotations,
          };
        });
      },

      getChoreStats: () => {
        const houseId = get().currentHouseId;
        const tasks = get().choreTasks.filter((t) => t.houseId === houseId);
        const assignments = get().choreAssignments.filter((a) => a.houseId === houseId);
        const rotations = get().choreRotations.filter((r) => r.houseId === houseId && r.enabled);
        const today = new Date().getDay() as DayOfWeek;
        const todayAssignments = assignments.filter((a) => a.dayOfWeek === today);

        return {
          totalTasks: tasks.length,
          totalAssignments: assignments.length,
          todayAssignments: todayAssignments.length,
          activeRotations: rotations.length,
        };
      },
    }),
    {
      name: 'borrow-tracker-storage',
    }
  )
);
