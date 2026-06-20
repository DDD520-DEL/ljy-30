import type { Roommate, BorrowRecord } from '@/types';

const now = new Date();
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

export const MOCK_ROOMMATES: Roommate[] = [
  {
    id: 'r1',
    name: '小明',
    avatar: '🐱',
    color: '#FF8C69',
    createdAt: threeDaysAgo.toISOString(),
  },
  {
    id: 'r2',
    name: '小红',
    avatar: '🐰',
    color: '#F472B6',
    createdAt: threeDaysAgo.toISOString(),
  },
  {
    id: 'r3',
    name: '大壮',
    avatar: '🐻',
    color: '#60A5FA',
    createdAt: twoDaysAgo.toISOString(),
  },
  {
    id: 'r4',
    name: '阿花',
    avatar: '🦊',
    color: '#A78BFA',
    createdAt: twoDaysAgo.toISOString(),
  },
];

export const MOCK_RECORDS: BorrowRecord[] = [
  {
    id: '1',
    type: 'lend',
    itemName: '洗衣液',
    itemEmoji: '🧴',
    roommateId: 'r1',
    roommateName: '小明',
    roommateAvatar: '🐱',
    borrowDate: twoDaysAgo.toISOString(),
    expectedReturnDate: oneDayLater.toISOString(),
    status: 'active',
    createdAt: twoDaysAgo.toISOString(),
    updatedAt: twoDaysAgo.toISOString(),
  },
  {
    id: '2',
    type: 'borrow',
    itemName: '充电器',
    itemEmoji: '🔌',
    roommateId: 'r2',
    roommateName: '小红',
    roommateAvatar: '🐰',
    borrowDate: oneDayAgo.toISOString(),
    expectedReturnDate: twoDaysLater.toISOString(),
    status: 'active',
    note: 'Type-C的快充头',
    createdAt: oneDayAgo.toISOString(),
    updatedAt: oneDayAgo.toISOString(),
  },
  {
    id: '3',
    type: 'lend',
    itemName: '吹风机',
    itemEmoji: '💨',
    roommateId: 'r3',
    roommateName: '大壮',
    roommateAvatar: '🐻',
    borrowDate: threeDaysAgo.toISOString(),
    expectedReturnDate: oneDayAgo.toISOString(),
    status: 'overdue',
    note: '洗完头记得还哦',
    createdAt: threeDaysAgo.toISOString(),
    updatedAt: threeDaysAgo.toISOString(),
  },
  {
    id: '4',
    type: 'borrow',
    itemName: '雨伞',
    itemEmoji: '☂️',
    roommateId: 'r4',
    roommateName: '阿花',
    roommateAvatar: '🦊',
    borrowDate: threeDaysAgo.toISOString(),
    expectedReturnDate: oneWeekLater.toISOString(),
    status: 'active',
    createdAt: threeDaysAgo.toISOString(),
    updatedAt: threeDaysAgo.toISOString(),
  },
  {
    id: '5',
    type: 'lend',
    itemName: '零食',
    itemEmoji: '🍿',
    roommateId: 'r2',
    roommateName: '小红',
    roommateAvatar: '🐰',
    borrowDate: threeDaysAgo.toISOString(),
    expectedReturnDate: twoDaysAgo.toISOString(),
    actualReturnDate: oneDayAgo.toISOString(),
    status: 'returned',
    note: '还了一大包薯片~',
    createdAt: threeDaysAgo.toISOString(),
    updatedAt: oneDayAgo.toISOString(),
  },
];
