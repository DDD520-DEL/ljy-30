import type { ItemOption } from '@/types';

export const COMMON_ITEMS: ItemOption[] = [
  { name: '洗衣液', emoji: '🧴' },
  { name: '充电器', emoji: '🔌' },
  { name: '吹风机', emoji: '💨' },
  { name: '雨伞', emoji: '☂️' },
  { name: '耳机', emoji: '🎧' },
  { name: '充电宝', emoji: '🔋' },
  { name: '剪刀', emoji: '✂️' },
  { name: '胶带', emoji: '📦' },
  { name: '纸巾', emoji: '🧻' },
  { name: '零食', emoji: '🍿' },
  { name: '饮料', emoji: '🥤' },
  { name: '书籍', emoji: '📚' },
  { name: '鼠标', emoji: '🖱️' },
  { name: '键盘', emoji: '⌨️' },
  { name: '衣服', emoji: '👕' },
  { name: '鞋子', emoji: '👟' },
];

export const CELEBRATION_EMOJIS = ['🎉', '✨', '🎊', '🥳', '💫', '⭐', '🌟', '🎈', '🎁', '💝'];

export const EMPTY_MESSAGES = {
  active: [
    { emoji: '📭', text: '目前没有借还记录，好清爽呀~' },
    { emoji: '🏠', text: '室友们都很乖，没人乱借东西' },
    { emoji: '🌿', text: '一片净土，什么都没借' },
  ],
  history: [
    { emoji: '📜', text: '历史记录空空如也' },
    { emoji: '🪶', text: '轻装上阵，没有历史包袱' },
  ],
  overdue: [
    { emoji: '✅', text: '太棒了！没有逾期记录' },
    { emoji: '🌟', text: '大家都是按时归还的好宝宝' },
  ],
  search: [
    { emoji: '🔍', text: '没有找到匹配的记录，换个关键词试试？' },
    { emoji: '🤔', text: '咦，好像没有这个物品的记录' },
    { emoji: '💨', text: '搜不到，可能这个物品不存在哦' },
  ],
};

export const ROOMMATE_COLORS = [
  '#FF8C69',
  '#34D399',
  '#60A5FA',
  '#A78BFA',
  '#F472B6',
  '#FBBF24',
  '#FB923C',
  '#4ADE80',
];

export const ROOMMATE_AVATARS = [
  '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦄',
];

export const RETURN_TIME_OPTIONS = [
  { label: '今天', days: 0 },
  { label: '明天', days: 1 },
  { label: '3天后', days: 3 },
  { label: '1周后', days: 7 },
  { label: '2周后', days: 14 },
  { label: '1个月后', days: 30 },
];
