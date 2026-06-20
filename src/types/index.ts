export type BorrowType = 'lend' | 'borrow';

export type BorrowStatus = 'active' | 'returned' | 'overdue';

export type FilterType = 'all' | 'lend' | 'borrow' | 'overdue';

export type SortType = 'returnDate' | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export interface Roommate {
  id: string;
  name: string;
  avatar: string;
  color: string;
  createdAt: string;
}

export interface BorrowRecord {
  id: string;
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
