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
