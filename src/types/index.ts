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
