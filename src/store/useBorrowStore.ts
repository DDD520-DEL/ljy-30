import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { House, BorrowRecord, Roommate, FilterType, BorrowStatus, SortType, SortOrder, InventoryItem, CompensationRecord, CompensationStatus, Comment, BorrowTemplate, Bill, BillStatus, Settlement, ChoreTask, ChoreAssignment, ChoreRotation, DayOfWeek, Announcement, Wish, WishStatus, Poll, PollVote, PollStatus, MaintenanceRecord, MaintenanceStatus, ReservationEntry, ReservationStatus, ExpressRecord, ExpressStatus } from '@/types';
import { MOCK_HOUSES, MOCK_RECORDS, MOCK_ROOMMATES, MOCK_INVENTORY, DEFAULT_HOUSE_ID, MOCK_CHORE_TASKS, MOCK_CHORE_ASSIGNMENTS, MOCK_CHORE_ROTATIONS, MOCK_ANNOUNCEMENTS, MOCK_WISHES, MOCK_POLLS, MOCK_POLL_VOTES, MOCK_MAINTENANCE_RECORDS } from '@/data/mockData';
import { isOverdue, isToday, isBirthdayToday, isMoveInAnniversaryToday, getDaysUntilBirthday, getDaysUntilMoveInAnniversary, getMonthBirthdays, getMonthMoveInAnniversaries } from '@/utils/date';

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
  getRoommates: () => Roommate[];
  getTodayBirthdays: () => Roommate[];
  getTodayMoveInAnniversaries: () => Roommate[];
  getMonthBirthdays: () => Roommate[];
  getMonthMoveInAnniversaries: () => Roommate[];
  getUpcomingBirthdays: (days?: number) => Roommate[];
  getUpcomingMoveInAnniversaries: (days?: number) => Roommate[];

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

  announcements: Announcement[];
  showAnnouncementModal: boolean;
  announcementRoommateId: string | null;
  setShowAnnouncementModal: (show: boolean) => void;
  setAnnouncementRoommateId: (id: string | null) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'houseId' | 'createdAt' | 'readBy'>) => void;
  deleteAnnouncement: (id: string) => void;
  markAnnouncementRead: (id: string, roommateId: string) => void;
  markAllAnnouncementsRead: (roommateId: string) => void;
  getAnnouncements: () => Announcement[];
  getActiveAnnouncements: () => Announcement[];
  getUnreadAnnouncementCount: (roommateId: string) => number;

  wishes: Wish[];
  showWishModal: boolean;
  showWishDetailModal: boolean;
  selectedWish: Wish | null;
  wishFilter: WishStatus | 'all';
  setShowWishModal: (show: boolean) => void;
  setShowWishDetailModal: (show: boolean) => void;
  setSelectedWish: (wish: Wish | null) => void;
  setWishFilter: (filter: WishStatus | 'all') => void;
  addWish: (wish: Omit<Wish, 'id' | 'houseId' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateWish: (id: string, updates: Partial<Wish>) => void;
  deleteWish: (id: string) => void;
  lendWish: (wishId: string, lenderId: string, lenderName: string, lenderAvatar: string, note?: string) => void;
  fulfillWish: (wishId: string, note?: string) => void;
  archiveWish: (wishId: string) => void;
  getWishes: () => Wish[];
  getWishesByStatus: (status: WishStatus | 'all') => Wish[];
  getActiveWishes: () => Wish[];
  getWishStats: () => { total: number; active: number; fulfilled: number; archived: number };

  polls: Poll[];
  pollVotes: PollVote[];
  showCreatePollModal: boolean;
  showPollDetailModal: boolean;
  selectedPoll: Poll | null;
  pollFilter: PollStatus | 'all';
  pollRoommateId: string | null;
  setShowCreatePollModal: (show: boolean) => void;
  setShowPollDetailModal: (show: boolean) => void;
  setSelectedPoll: (poll: Poll | null) => void;
  setPollFilter: (filter: PollStatus | 'all') => void;
  setPollRoommateId: (id: string | null) => void;
  addPoll: (poll: Omit<Poll, 'id' | 'houseId' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updatePoll: (id: string, updates: Partial<Poll>) => void;
  deletePoll: (id: string) => void;
  votePoll: (pollId: string, optionIds: string[], roommateId: string, roommateName: string, roommateAvatar: string) => boolean;
  cancelVote: (pollId: string, roommateId: string) => void;
  endPoll: (id: string) => void;
  archivePoll: (id: string) => void;
  checkPollsEnded: () => void;
  getPolls: () => Poll[];
  getPollsByStatus: (status: PollStatus | 'all') => Poll[];
  getVotesByPollId: (pollId: string) => PollVote[];
  getVoteByPollAndRoommate: (pollId: string, roommateId: string) => PollVote | undefined;
  getPollStats: () => { total: number; active: number; ended: number; archived: number };

  maintenanceRecords: MaintenanceRecord[];
  showAddMaintenanceModal: boolean;
  showMaintenanceDetailModal: boolean;
  selectedMaintenance: MaintenanceRecord | null;
  maintenanceFilter: MaintenanceStatus | 'all';

  setShowAddMaintenanceModal: (show: boolean) => void;
  setShowMaintenanceDetailModal: (show: boolean) => void;
  setSelectedMaintenance: (record: MaintenanceRecord | null) => void;
  setMaintenanceFilter: (filter: MaintenanceStatus | 'all') => void;

  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'houseId' | 'status' | 'reportedAt' | 'createdAt' | 'updatedAt'>) => void;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void;
  deleteMaintenanceRecord: (id: string) => void;
  startMaintenance: (id: string, repairerId: string, repairerName: string, repairerAvatar: string) => void;
  completeMaintenance: (id: string, cost: number, repairNote: string) => void;

  getMaintenanceRecords: () => MaintenanceRecord[];
  getMaintenanceRecordsByStatus: (status: MaintenanceStatus | 'all') => MaintenanceRecord[];
  getMaintenanceStats: () => { total: number; pending: number; repairing: number; completed: number; totalCost: number };

  reservations: ReservationEntry[];
  addReservation: (recordId: string, roommateId: string, roommateName: string, roommateAvatar: string) => void;
  cancelReservation: (entryId: string) => void;
  getReservationsByRecordId: (recordId: string) => ReservationEntry[];
  getWaitingReservationsByRecordId: (recordId: string) => ReservationEntry[];
  getReservationByRecordAndRoommate: (recordId: string, roommateId: string) => ReservationEntry | undefined;
  getReservationCountByRecordId: (recordId: string) => number;
  notifyNextInQueue: (recordId: string) => ReservationEntry | undefined;
  fulfillReservation: (entryId: string) => void;
  getReservationStats: () => { total: number; waiting: number; notified: number; cancelled: number; fulfilled: number };

      expressRecords: ExpressRecord[];
      showAddExpressModal: boolean;
      showExpressDetailModal: boolean;
      selectedExpress: ExpressRecord | null;
      expressFilter: ExpressStatus | 'all';

      setShowAddExpressModal: (show: boolean) => void;
      setShowExpressDetailModal: (show: boolean) => void;
      setSelectedExpress: (record: ExpressRecord | null) => void;
      setExpressFilter: (filter: ExpressStatus | 'all') => void;

      addExpressRecord: (record: Omit<ExpressRecord, 'id' | 'houseId' | 'status' | 'createdAt' | 'updatedAt'>) => void;
      updateExpressRecord: (id: string, updates: Partial<ExpressRecord>) => void;
      deleteExpressRecord: (id: string) => void;
      pickUpExpress: (id: string) => void;

      getExpressRecords: () => ExpressRecord[];
      getExpressRecordsByStatus: (status: ExpressStatus | 'all') => ExpressRecord[];
      getPendingExpressCount: () => number;
      getPendingExpressByRecipient: (recipientId: string) => ExpressRecord[];
      getExpressStats: () => { total: number; pending: number; picked: number };
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
      announcements: MOCK_ANNOUNCEMENTS,
      showAnnouncementModal: false,
      announcementRoommateId: null,
      wishes: MOCK_WISHES,
      showWishModal: false,
      showWishDetailModal: false,
      selectedWish: null,
      wishFilter: 'all',
      polls: MOCK_POLLS,
      pollVotes: MOCK_POLL_VOTES,
      showCreatePollModal: false,
      showPollDetailModal: false,
      selectedPoll: null,
      pollFilter: 'all',
      pollRoommateId: null,
      maintenanceRecords: MOCK_MAINTENANCE_RECORDS,
      reservations: [],
      showAddMaintenanceModal: false,
      showMaintenanceDetailModal: false,
      selectedMaintenance: null,
      maintenanceFilter: 'all',
      expressRecords: [],
      showAddExpressModal: false,
      showExpressDetailModal: false,
      selectedExpress: null,
      expressFilter: 'all',
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
            announcementRoommateId: null,
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
          announcements: state.announcements.filter((a) => a.houseId !== houseId),
          wishes: state.wishes.filter((w) => w.houseId !== houseId),
          polls: state.polls.filter((p) => p.houseId !== houseId),
          pollVotes: state.pollVotes.filter((v) => {
            const poll = state.polls.find((p) => p.id === v.pollId);
            return poll && poll.houseId === houseId ? false : true;
          }),
          maintenanceRecords: state.maintenanceRecords.filter((r) => r.houseId !== houseId),
          reservations: state.reservations.filter((r) => r.houseId !== houseId),
          expressRecords: state.expressRecords.filter((r) => r.houseId !== houseId),
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

        if (record) {
          get().notifyNextInQueue(id);
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
          reservations: state.reservations.filter((r) => r.recordId !== id),
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

      getRoommates: () => {
        const houseId = get().currentHouseId;
        return get().roommates.filter((r) => r.houseId === houseId);
      },

      getTodayBirthdays: () => {
        const houseId = get().currentHouseId;
        return get().roommates.filter(
          (r) => r.houseId === houseId && isBirthdayToday(r.birthday || '')
        );
      },

      getTodayMoveInAnniversaries: () => {
        const houseId = get().currentHouseId;
        return get().roommates.filter(
          (r) => r.houseId === houseId && isMoveInAnniversaryToday(r.moveInDate || '')
        );
      },

      getMonthBirthdays: () => {
        const houseId = get().currentHouseId;
        const houseRoommates = get().roommates.filter((r) => r.houseId === houseId);
        return getMonthBirthdays(houseRoommates) as Roommate[];
      },

      getMonthMoveInAnniversaries: () => {
        const houseId = get().currentHouseId;
        const houseRoommates = get().roommates.filter((r) => r.houseId === houseId);
        return getMonthMoveInAnniversaries(houseRoommates) as Roommate[];
      },

      getUpcomingBirthdays: (days = 7) => {
        const houseId = get().currentHouseId;
        return get()
          .roommates.filter((r) => {
            if (r.houseId !== houseId || !r.birthday) return false;
            const daysUntil = getDaysUntilBirthday(r.birthday);
            return daysUntil >= 0 && daysUntil <= days;
          })
          .sort((a, b) => getDaysUntilBirthday(a.birthday!) - getDaysUntilBirthday(b.birthday!));
      },

      getUpcomingMoveInAnniversaries: (days = 7) => {
        const houseId = get().currentHouseId;
        return get()
          .roommates.filter((r) => {
            if (r.houseId !== houseId || !r.moveInDate) return false;
            const daysUntil = getDaysUntilMoveInAnniversary(r.moveInDate);
            return daysUntil >= 0 && daysUntil <= days;
          })
          .sort((a, b) =>
            getDaysUntilMoveInAnniversary(a.moveInDate!) - getDaysUntilMoveInAnniversary(b.moveInDate!)
          );
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
        const { roommates, choreRotations } = get();
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

      setShowAnnouncementModal: (show) => set({ showAnnouncementModal: show }),

      setAnnouncementRoommateId: (id) => set({ announcementRoommateId: id }),

      addAnnouncement: (announcement) => {
        const now = new Date().toISOString();
        const newAnnouncement: Announcement = {
          ...announcement,
          id: generateId(),
          houseId: get().currentHouseId,
          readBy: [],
          createdAt: now,
        };
        set((state) => ({ announcements: [newAnnouncement, ...state.announcements] }));
      },

      deleteAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
        }));
      },

      markAnnouncementRead: (id, roommateId) => {
        set((state) => ({
          announcements: state.announcements.map((a) => {
            if (a.id === id && !a.readBy.includes(roommateId)) {
              return { ...a, readBy: [...a.readBy, roommateId] };
            }
            return a;
          }),
        }));
      },

      markAllAnnouncementsRead: (roommateId) => {
        set((state) => ({
          announcements: state.announcements.map((a) => {
            if (a.houseId === state.currentHouseId && !a.readBy.includes(roommateId)) {
              return { ...a, readBy: [...a.readBy, roommateId] };
            }
            return a;
          }),
        }));
      },

      getAnnouncements: () => {
        const houseId = get().currentHouseId;
        return get()
          .announcements.filter((a) => a.houseId === houseId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getActiveAnnouncements: () => {
        const houseId = get().currentHouseId;
        const now = new Date();
        return get()
          .announcements.filter((a) => {
            if (a.houseId !== houseId) return false;
            if (a.expiresAt && new Date(a.expiresAt) < now) return false;
            return true;
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getUnreadAnnouncementCount: (roommateId) => {
        const houseId = get().currentHouseId;
        const now = new Date();
        return get().announcements.filter((a) => {
          if (a.houseId !== houseId) return false;
          if (a.expiresAt && new Date(a.expiresAt) < now) return false;
          return !a.readBy.includes(roommateId);
        }).length;
      },

      setShowWishModal: (show) => set({ showWishModal: show }),

      setShowWishDetailModal: (show) => set({ showWishDetailModal: show }),

      setSelectedWish: (wish) => set({ selectedWish: wish }),

      setWishFilter: (filter) => set({ wishFilter: filter }),

      addWish: (wish) => {
        const now = new Date().toISOString();
        const newWish: Wish = {
          ...wish,
          id: generateId(),
          houseId: get().currentHouseId,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ wishes: [newWish, ...state.wishes] }));
      },

      updateWish: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          wishes: state.wishes.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: now } : w
          ),
        }));
      },

      deleteWish: (id) => {
        set((state) => ({
          wishes: state.wishes.filter((w) => w.id !== id),
        }));
      },

      lendWish: (wishId, lenderId, lenderName, lenderAvatar, note) => {
        const now = new Date().toISOString();
        set((state) => ({
          wishes: state.wishes.map((w) =>
            w.id === wishId
              ? {
                  ...w,
                  lenderId,
                  lenderName,
                  lenderAvatar,
                  status: 'fulfilled',
                  note: note || w.note,
                  fulfilledAt: now,
                  updatedAt: now,
                }
              : w
          ),
        }));
      },

      fulfillWish: (wishId, note) => {
        const now = new Date().toISOString();
        set((state) => ({
          wishes: state.wishes.map((w) =>
            w.id === wishId
              ? {
                  ...w,
                  status: 'fulfilled',
                  note: note || w.note,
                  fulfilledAt: now,
                  updatedAt: now,
                }
              : w
          ),
        }));
      },

      archiveWish: (wishId) => {
        const now = new Date().toISOString();
        set((state) => ({
          wishes: state.wishes.map((w) =>
            w.id === wishId
              ? {
                  ...w,
                  status: 'archived',
                  archivedAt: now,
                  updatedAt: now,
                }
              : w
          ),
        }));
      },

      getWishes: () => {
        const houseId = get().currentHouseId;
        return get()
          .wishes.filter((w) => w.houseId === houseId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getWishesByStatus: (status) => {
        const houseId = get().currentHouseId;
        let filtered = get().wishes.filter((w) => w.houseId === houseId);
        if (status !== 'all') {
          filtered = filtered.filter((w) => w.status === status);
        }
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getActiveWishes: () => {
        const houseId = get().currentHouseId;
        return get()
          .wishes.filter((w) => w.houseId === houseId && w.status === 'active')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getWishStats: () => {
        const houseId = get().currentHouseId;
        const wishes = get().wishes.filter((w) => w.houseId === houseId);
        return {
          total: wishes.length,
          active: wishes.filter((w) => w.status === 'active').length,
          fulfilled: wishes.filter((w) => w.status === 'fulfilled').length,
          archived: wishes.filter((w) => w.status === 'archived').length,
        };
      },

      setShowCreatePollModal: (show) => set({ showCreatePollModal: show }),

      setShowPollDetailModal: (show) => set({ showPollDetailModal: show }),

      setSelectedPoll: (poll) => set({ selectedPoll: poll }),

      setPollFilter: (filter) => set({ pollFilter: filter }),

      setPollRoommateId: (id) => set({ pollRoommateId: id }),

      addPoll: (poll) => {
        const now = new Date().toISOString();
        const newPoll: Poll = {
          ...poll,
          id: generateId(),
          houseId: get().currentHouseId,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ polls: [newPoll, ...state.polls] }));
      },

      updatePoll: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          polls: state.polls.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: now } : p
          ),
        }));
      },

      deletePoll: (id) => {
        set((state) => ({
          polls: state.polls.filter((p) => p.id !== id),
          pollVotes: state.pollVotes.filter((v) => v.pollId !== id),
        }));
      },

      votePoll: (pollId, optionIds, roommateId, roommateName, roommateAvatar) => {
        const poll = get().polls.find((p) => p.id === pollId);
        if (!poll || poll.status !== 'active') return false;
        if (new Date(poll.endAt) < new Date()) return false;

        const now = new Date().toISOString();
        set((state) => {
          const existingVoteIndex = state.pollVotes.findIndex(
            (v) => v.pollId === pollId && v.roommateId === roommateId
          );
          const newVotes = [...state.pollVotes];
          const newVote: PollVote = {
            id: generateId(),
            pollId,
            optionIds,
            roommateId,
            roommateName,
            roommateAvatar,
            createdAt: now,
          };
          if (existingVoteIndex !== -1) {
            newVotes[existingVoteIndex] = newVote;
          } else {
            newVotes.push(newVote);
          }
          return { pollVotes: newVotes };
        });
        return true;
      },

      cancelVote: (pollId, roommateId) => {
        set((state) => ({
          pollVotes: state.pollVotes.filter(
            (v) => !(v.pollId === pollId && v.roommateId === roommateId)
          ),
        }));
      },

      endPoll: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          polls: state.polls.map((p) =>
            p.id === id ? { ...p, status: 'ended', updatedAt: now } : p
          ),
        }));
      },

      archivePoll: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          polls: state.polls.map((p) =>
            p.id === id ? { ...p, status: 'archived', updatedAt: now } : p
          ),
        }));
      },

      checkPollsEnded: () => {
        const houseId = get().currentHouseId;
        const now = new Date();
        set((state) => ({
          polls: state.polls.map((p) => {
            if (
              p.houseId === houseId &&
              p.status === 'active' &&
              new Date(p.endAt) < now
            ) {
              return { ...p, status: 'ended', updatedAt: now.toISOString() };
            }
            return p;
          }),
        }));
      },

      getPolls: () => {
        const houseId = get().currentHouseId;
        return get()
          .polls.filter((p) => p.houseId === houseId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getPollsByStatus: (status) => {
        const houseId = get().currentHouseId;
        get().checkPollsEnded();
        let filtered = get().polls.filter((p) => p.houseId === houseId);
        if (status !== 'all') {
          filtered = filtered.filter((p) => p.status === status);
        }
        return filtered.sort((a, b) => {
          if (a.status === 'active' && b.status !== 'active') return -1;
          if (a.status !== 'active' && b.status === 'active') return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      },

      getVotesByPollId: (pollId) => {
        return get().pollVotes.filter((v) => v.pollId === pollId);
      },

      getVoteByPollAndRoommate: (pollId, roommateId) => {
        return get().pollVotes.find(
          (v) => v.pollId === pollId && v.roommateId === roommateId
        );
      },

      getPollStats: () => {
        const houseId = get().currentHouseId;
        get().checkPollsEnded();
        const polls = get().polls.filter((p) => p.houseId === houseId);
        return {
          total: polls.length,
          active: polls.filter((p) => p.status === 'active').length,
          ended: polls.filter((p) => p.status === 'ended').length,
          archived: polls.filter((p) => p.status === 'archived').length,
        };
      },

      setShowAddMaintenanceModal: (show) => set({ showAddMaintenanceModal: show }),

      setShowMaintenanceDetailModal: (show) => set({ showMaintenanceDetailModal: show }),

      setSelectedMaintenance: (record) => set({ selectedMaintenance: record }),

      setMaintenanceFilter: (filter) => set({ maintenanceFilter: filter }),

      addMaintenanceRecord: (record) => {
        const now = new Date().toISOString();
        const newRecord: MaintenanceRecord = {
          ...record,
          id: generateId(),
          houseId: get().currentHouseId,
          status: 'pending',
          reportedAt: now,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ maintenanceRecords: [newRecord, ...state.maintenanceRecords] }));
      },

      updateMaintenanceRecord: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          maintenanceRecords: state.maintenanceRecords.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: now } : r
          ),
        }));
      },

      deleteMaintenanceRecord: (id) => {
        set((state) => ({
          maintenanceRecords: state.maintenanceRecords.filter((r) => r.id !== id),
        }));
      },

      startMaintenance: (id, repairerId, repairerName, repairerAvatar) => {
        const now = new Date().toISOString();
        set((state) => ({
          maintenanceRecords: state.maintenanceRecords.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'repairing',
                  repairerId,
                  repairerName,
                  repairerAvatar,
                  startedAt: now,
                  updatedAt: now,
                }
              : r
          ),
        }));
      },

      completeMaintenance: (id, cost, repairNote) => {
        const now = new Date().toISOString();
        set((state) => ({
          maintenanceRecords: state.maintenanceRecords.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'completed',
                  cost,
                  repairNote,
                  completedAt: now,
                  updatedAt: now,
                }
              : r
          ),
        }));
      },

      getMaintenanceRecords: () => {
        const houseId = get().currentHouseId;
        return get()
          .maintenanceRecords.filter((r) => r.houseId === houseId)
          .sort((a, b) => {
            const statusOrder = { pending: 0, repairing: 1, completed: 2 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
              return statusOrder[a.status] - statusOrder[b.status];
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
      },

      getMaintenanceRecordsByStatus: (status) => {
        const houseId = get().currentHouseId;
        let filtered = get().maintenanceRecords.filter((r) => r.houseId === houseId);
        if (status !== 'all') {
          filtered = filtered.filter((r) => r.status === status);
        }
        return filtered.sort((a, b) => {
          const statusOrder = { pending: 0, repairing: 1, completed: 2 };
          if (status !== 'all') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      },

      getMaintenanceStats: () => {
        const houseId = get().currentHouseId;
        const records = get().maintenanceRecords.filter((r) => r.houseId === houseId);
        const completed = records.filter((r) => r.status === 'completed');
        const totalCost = completed.reduce((sum, r) => sum + (r.cost || 0), 0);
        return {
          total: records.length,
          pending: records.filter((r) => r.status === 'pending').length,
          repairing: records.filter((r) => r.status === 'repairing').length,
          completed: completed.length,
          totalCost,
        };
      },

      addReservation: (recordId, roommateId, roommateName, roommateAvatar) => {
        const existing = get().getReservationByRecordAndRoommate(recordId, roommateId);
        if (existing && existing.status !== 'cancelled') return;

        const houseId = get().currentHouseId;
        const now = new Date().toISOString();
        const waitingCount = get().reservations.filter(
          (r) => r.recordId === recordId && r.houseId === houseId && r.status === 'waiting'
        ).length;

        const newEntry: ReservationEntry = {
          id: generateId(),
          houseId,
          recordId,
          roommateId,
          roommateName,
          roommateAvatar,
          status: 'waiting',
          position: waitingCount + 1,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ reservations: [...state.reservations, newEntry] }));
      },

      cancelReservation: (entryId) => {
        const now = new Date().toISOString();
        set((state) => {
          const entry = state.reservations.find((r) => r.id === entryId);
          if (!entry || entry.status === 'cancelled') return state;

          const updated = state.reservations.map((r) =>
            r.id === entryId
              ? { ...r, status: 'cancelled' as ReservationStatus, cancelledAt: now, updatedAt: now }
              : r
          );

          const waitingEntries = updated.filter(
            (r) => r.recordId === entry.recordId && r.houseId === entry.houseId && r.status === 'waiting'
          ).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

          const repositioned = updated.map((r) => {
            if (r.recordId === entry.recordId && r.houseId === entry.houseId && r.status === 'waiting') {
              const idx = waitingEntries.findIndex((w) => w.id === r.id);
              if (idx !== -1 && r.position !== idx + 1) {
                return { ...r, position: idx + 1, updatedAt: now };
              }
            }
            return r;
          });

          return { reservations: repositioned };
        });
      },

      getReservationsByRecordId: (recordId) => {
        const houseId = get().currentHouseId;
        return get()
          .reservations.filter((r) => r.houseId === houseId && r.recordId === recordId)
          .sort((a, b) => {
            const statusOrder: Record<ReservationStatus, number> = { notified: 0, waiting: 1, fulfilled: 2, cancelled: 3 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
              return statusOrder[a.status] - statusOrder[b.status];
            }
            return a.position - b.position;
          });
      },

      getWaitingReservationsByRecordId: (recordId) => {
        const houseId = get().currentHouseId;
        return get()
          .reservations.filter((r) => r.houseId === houseId && r.recordId === recordId && r.status === 'waiting')
          .sort((a, b) => a.position - b.position);
      },

      getReservationByRecordAndRoommate: (recordId, roommateId) => {
        const houseId = get().currentHouseId;
        return get().reservations.find(
          (r) => r.houseId === houseId && r.recordId === recordId && r.roommateId === roommateId && r.status !== 'cancelled'
        );
      },

      getReservationCountByRecordId: (recordId) => {
        const houseId = get().currentHouseId;
        return get().reservations.filter(
          (r) => r.houseId === houseId && r.recordId === recordId && r.status === 'waiting'
        ).length;
      },

      notifyNextInQueue: (recordId) => {
        const houseId = get().currentHouseId;
        const waiting = get()
          .reservations.filter((r) => r.houseId === houseId && r.recordId === recordId && r.status === 'waiting')
          .sort((a, b) => a.position - b.position);

        if (waiting.length === 0) return undefined;

        const next = waiting[0];
        const now = new Date().toISOString();
        const record = get().records.find((r) => r.id === recordId);

        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === next.id
              ? { ...r, status: 'notified' as ReservationStatus, notifiedAt: now, updatedAt: now }
              : r
          ),
        }));

        if (record) {
          get().addAnnouncement({
            content: `${next.roommateName} 排队预约的「${record.itemEmoji} ${record.itemName}」已归还，轮到你借用了！`,
            roommateId: next.roommateId,
            roommateName: next.roommateName,
            roommateAvatar: next.roommateAvatar,
            emoji: '🔔',
          });
        }

        return { ...next, status: 'notified' as ReservationStatus, notifiedAt: now, updatedAt: now };
      },

      fulfillReservation: (entryId) => {
        const now = new Date().toISOString();
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === entryId
              ? { ...r, status: 'fulfilled' as ReservationStatus, fulfilledAt: now, updatedAt: now }
              : r
          ),
        }));
      },

      getReservationStats: () => {
        const houseId = get().currentHouseId;
        const reservations = get().reservations.filter((r) => r.houseId === houseId);
        return {
          total: reservations.length,
          waiting: reservations.filter((r) => r.status === 'waiting').length,
          notified: reservations.filter((r) => r.status === 'notified').length,
          cancelled: reservations.filter((r) => r.status === 'cancelled').length,
          fulfilled: reservations.filter((r) => r.status === 'fulfilled').length,
        };
      },

      setShowAddExpressModal: (show) => set({ showAddExpressModal: show }),
      setShowExpressDetailModal: (show) => set({ showExpressDetailModal: show }),
      setSelectedExpress: (record) => set({ selectedExpress: record }),
      setExpressFilter: (filter) => set({ expressFilter: filter }),

      addExpressRecord: (record) => {
        const now = new Date().toISOString();
        const newRecord: ExpressRecord = {
          ...record,
          id: generateId(),
          houseId: get().currentHouseId,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ expressRecords: [newRecord, ...state.expressRecords] }));
      },

      updateExpressRecord: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          expressRecords: state.expressRecords.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: now } : r
          ),
        }));
      },

      deleteExpressRecord: (id) => {
        set((state) => ({
          expressRecords: state.expressRecords.filter((r) => r.id !== id),
        }));
      },

      pickUpExpress: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          expressRecords: state.expressRecords.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'picked' as const,
                  pickedAt: now,
                  updatedAt: now,
                }
              : r
          ),
        }));
      },

      getExpressRecords: () => {
        const houseId = get().currentHouseId;
        return get()
          .expressRecords.filter((r) => r.houseId === houseId)
          .sort((a, b) => {
            const statusOrder = { pending: 0, picked: 1 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
              return statusOrder[a.status] - statusOrder[b.status];
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
      },

      getExpressRecordsByStatus: (status) => {
        const houseId = get().currentHouseId;
        let filtered = get().expressRecords.filter((r) => r.houseId === houseId);
        if (status !== 'all') {
          filtered = filtered.filter((r) => r.status === status);
        }
        return filtered.sort((a, b) => {
          if (status === 'all') {
            const statusOrder = { pending: 0, picked: 1 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
              return statusOrder[a.status] - statusOrder[b.status];
            }
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      },

      getPendingExpressCount: () => {
        const houseId = get().currentHouseId;
        return get().expressRecords.filter((r) => r.houseId === houseId && r.status === 'pending').length;
      },

      getPendingExpressByRecipient: (recipientId) => {
        const houseId = get().currentHouseId;
        return get()
          .expressRecords.filter((r) => r.houseId === houseId && r.status === 'pending' && r.recipientId === recipientId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getExpressStats: () => {
        const houseId = get().currentHouseId;
        const records = get().expressRecords.filter((r) => r.houseId === houseId);
        return {
          total: records.length,
          pending: records.filter((r) => r.status === 'pending').length,
          picked: records.filter((r) => r.status === 'picked').length,
        };
      },
    }),
    {
      name: 'borrow-tracker-storage',
    }
  )
);
