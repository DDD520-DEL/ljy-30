export type BorrowType = 'lend' | 'borrow';

export type BorrowStatus = 'active' | 'returned' | 'overdue';

export type CompensationStatus = 'pending' | 'paid';

export type FilterType = 'all' | 'lend' | 'borrow' | 'overdue';

export type SortType = 'returnDate' | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export interface House {
  id: string;
  name: string;
  inviteCode: string;
  emoji: string;
  createdAt: string;
}

export interface Roommate {
  id: string;
  houseId: string;
  name: string;
  avatar: string;
  color: string;
  birthday?: string;
  moveInDate?: string;
  createdAt: string;
}

export interface BorrowRecord {
  id: string;
  houseId: string;
  type: BorrowType;
  itemName: string;
  itemEmoji: string;
  itemId?: string;
  quantity?: number;
  roommateId: string;
  roommateName: string;
  roommateAvatar: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: BorrowStatus;
  note?: string;
  isDamaged?: boolean;
  damageDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompensationRecord {
  id: string;
  houseId: string;
  borrowRecordId: string;
  itemName: string;
  itemEmoji: string;
  roommateId: string;
  roommateName: string;
  roommateAvatar: string;
  damageDescription: string;
  amount: number;
  status: CompensationStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemOption {
  name: string;
  emoji: string;
}

export interface CelebrationEmoji {
  id: number;
  emoji: string;
  left: number;
  delay: number;
}

export interface InventoryItem {
  id: string;
  houseId: string;
  name: string;
  emoji: string;
  isConsumable: boolean;
  totalQuantity: number;
  currentQuantity: number;
  threshold: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  houseId: string;
  recordId: string;
  roommateId: string;
  roommateName: string;
  roommateAvatar: string;
  content: string;
  createdAt: string;
}

export interface BorrowTemplate {
  id: string;
  houseId: string;
  name: string;
  type: BorrowType;
  itemName: string;
  itemEmoji: string;
  itemId?: string;
  quantity?: number;
  useInventoryItem: boolean;
  roommateId: string;
  roommateName: string;
  roommateAvatar: string;
  returnDays: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type BillCategory = 'electricity' | 'water' | 'gas' | 'internet' | 'property' | 'other';

export type SplitMode = 'equal' | 'custom';

export type BillStatus = 'pending' | 'settled';

export interface BillParticipant {
  roommateId: string;
  roommateName: string;
  roommateAvatar: string;
  amount: number;
  paid: boolean;
  paidAt?: string;
}

export interface Bill {
  id: string;
  houseId: string;
  category: BillCategory;
  title: string;
  emoji: string;
  totalAmount: number;
  payerId: string;
  payerName: string;
  payerAvatar: string;
  splitMode: SplitMode;
  participants: BillParticipant[];
  billDate: string;
  note?: string;
  status: BillStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  fromRoommateId: string;
  fromRoommateName: string;
  fromRoommateAvatar: string;
  toRoommateId: string;
  toRoommateName: string;
  toRoommateAvatar: string;
  amount: number;
}

export interface BillCategoryOption {
  key: BillCategory;
  name: string;
  emoji: string;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ChoreTask {
  id: string;
  houseId: string;
  name: string;
  emoji: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChoreAssignment {
  id: string;
  houseId: string;
  taskId: string;
  taskName: string;
  taskEmoji: string;
  dayOfWeek: DayOfWeek;
  roommateId: string;
  roommateName: string;
  roommateAvatar: string;
  roommateColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChoreRotation {
  id: string;
  houseId: string;
  taskId: string;
  enabled: boolean;
  startDate: string;
  currentOffset: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChoreTaskOption {
  name: string;
  emoji: string;
  description: string;
}

export interface Announcement {
  id: string;
  houseId: string;
  content: string;
  roommateId: string;
  roommateName: string;
  roommateAvatar: string;
  emoji?: string;
  readBy: string[];
  createdAt: string;
  expiresAt?: string;
}

export type WishStatus = 'active' | 'fulfilled' | 'archived';

export interface Wish {
  id: string;
  houseId: string;
  title: string;
  description: string;
  emoji: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  lenderId?: string;
  lenderName?: string;
  lenderAvatar?: string;
  status: WishStatus;
  expectedReturnDays?: number;
  note?: string;
  fulfilledAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishLendOffer {
  wishId: string;
  lenderId: string;
  lenderName: string;
  lenderAvatar: string;
  note?: string;
  createdAt: string;
}

export type PollStatus = 'active' | 'ended' | 'archived';

export type PollVisibility = 'public' | 'anonymous';

export type PollType = 'single' | 'multiple';

export interface PollOption {
  id: string;
  text: string;
  emoji?: string;
}

export interface PollVote {
  id: string;
  pollId: string;
  optionIds: string[];
  roommateId: string;
  roommateName: string;
  roommateAvatar: string;
  createdAt: string;
}

export interface Poll {
  id: string;
  houseId: string;
  title: string;
  description: string;
  emoji: string;
  type: PollType;
  visibility: PollVisibility;
  options: PollOption[];
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  status: PollStatus;
  endAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PollFilterOption {
  key: PollStatus | 'all';
  label: string;
  emoji: string;
}

export type MaintenanceStatus = 'pending' | 'repairing' | 'completed';

export interface MaintenanceRecord {
  id: string;
  houseId: string;
  itemName: string;
  itemEmoji: string;
  description: string;
  reporterId: string;
  reporterName: string;
  reporterAvatar: string;
  status: MaintenanceStatus;
  repairerId?: string;
  repairerName?: string;
  repairerAvatar?: string;
  cost?: number;
  repairNote?: string;
  reportedAt: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceFilterOption {
  key: MaintenanceStatus | 'all';
  label: string;
  emoji: string;
}

export interface MaintenanceItemOption {
  name: string;
  emoji: string;
}
