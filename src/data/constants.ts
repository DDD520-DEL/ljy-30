import type { ItemOption, BillCategoryOption, ChoreTaskOption } from '@/types';

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

export const BILL_CATEGORIES: BillCategoryOption[] = [
  { key: 'electricity', name: '电费', emoji: '⚡' },
  { key: 'water', name: '水费', emoji: '💧' },
  { key: 'gas', name: '燃气费', emoji: '🔥' },
  { key: 'internet', name: '网费', emoji: '📶' },
  { key: 'property', name: '物业费', emoji: '🏢' },
  { key: 'other', name: '其他', emoji: '💰' },
];

export const BILL_EMPTY_MESSAGES = {
  all: [
    { emoji: '📭', text: '还没有账单记录哦~' },
    { emoji: '🏠', text: '大家还没产生公共费用' },
  ],
  pending: [
    { emoji: '✅', text: '太棒了！没有待结算的账单' },
    { emoji: '💰', text: '所有账单都已结清啦' },
  ],
  settled: [
    { emoji: '📜', text: '还没有已结算的账单' },
    { emoji: '🪶', text: '历史账单空空如也' },
  ],
};

export const CHORE_TASK_OPTIONS: ChoreTaskOption[] = [
  { name: '扫地', emoji: '🧹', description: '打扫客厅和卧室地面' },
  { name: '拖地', emoji: '🪣', description: '用拖把清洁地面' },
  { name: '倒垃圾', emoji: '🗑️', description: '倒掉所有垃圾桶并更换垃圾袋' },
  { name: '擦厨房', emoji: '🍳', description: '擦拭灶台、台面和油烟机' },
  { name: '洗碗', emoji: '🍽️', description: '清洗所有餐具并擦干归位' },
  { name: '擦桌子', emoji: '🪑', description: '擦拭餐桌和书桌' },
  { name: '浇花', emoji: '🪴', description: '给所有植物浇水' },
  { name: '整理客厅', emoji: '🛋️', description: '整理沙发、抱枕和杂物' },
  { name: '卫生间清洁', emoji: '🚽', description: '清洁马桶、洗手台和地面' },
  { name: '扔快递盒', emoji: '📦', description: '整理并扔掉快递包装盒' },
];

export const WEEKDAYS = [
  { key: 0, label: '周日', short: '日' },
  { key: 1, label: '周一', short: '一' },
  { key: 2, label: '周二', short: '二' },
  { key: 3, label: '周三', short: '三' },
  { key: 4, label: '周四', short: '四' },
  { key: 5, label: '周五', short: '五' },
  { key: 6, label: '周六', short: '六' },
];

export const CHORE_EMPTY_MESSAGES = {
  noTasks: [
    { emoji: '🧹', text: '还没有添加家务任务' },
    { emoji: '🏠', text: '点击下方按钮添加第一个任务' },
  ],
  noAssignments: [
    { emoji: '📅', text: '本周还没有排班安排' },
    { emoji: '✨', text: '点击任务卡片分配值日吧' },
  ],
};

export const WISH_EMOJIS = [
  '📚', '✂️', '🔋', '☂️', '🧴', '🎧', '🖱️', '⌨️',
  '💨', '📦', '🚲', '🎮', '📷', '🎸', '⚽', '🏀',
  '🎨', '🔧', '🪓', '🧰', '💡', '🔦', '🧹', '🪣',
  '🍳', '🥘', '🍽️', '🥤', '🧃', '🌱', '🪴', '🌸',
];

export const WISH_RETURN_OPTIONS = [
  { label: '用完即还', days: 0 },
  { label: '1天内', days: 1 },
  { label: '3天内', days: 3 },
  { label: '1周内', days: 7 },
  { label: '2周内', days: 14 },
  { label: '1个月内', days: 30 },
];

export const WISH_FILTER_OPTIONS = [
  { key: 'all', label: '全部', emoji: '📋' },
  { key: 'active', label: '待借出', emoji: '🎯' },
  { key: 'fulfilled', label: '已借出', emoji: '✅' },
  { key: 'archived', label: '已归档', emoji: '📦' },
];

export const WISH_EMPTY_MESSAGES = {
  all: [
    { emoji: '🌟', text: '还没有心愿，快来发布第一个吧~' },
    { emoji: '🎯', text: '室友们都很佛系，暂无心愿' },
  ],
  active: [
    { emoji: '✅', text: '太棒了！所有心愿都已实现' },
    { emoji: '🎊', text: '暂无待借出的心愿' },
  ],
  fulfilled: [
    { emoji: '📭', text: '还没有已实现的心愿' },
    { emoji: '💪', text: '加油，让更多心愿实现吧！' },
  ],
  archived: [
    { emoji: '📦', text: '归档区空空如也' },
    { emoji: '🪶', text: '还没有已完成归档的心愿' },
  ],
};

export const POLL_EMOJIS = [
  '🗳️', '🐱', '🐶', '⚡', '❄️', '🔥', '🎉', '🍕',
  '🎮', '📺', '🎵', '📚', '🏠', '🌙', '☀️', '🌿',
  '🍿', '☕', '🧹', '🛋️', '🚿', '🚪', '💡', '🔔',
  '🎯', '💬', '🤝', '🧊', '🌡️', '🐾', '🪴', '✨',
];

export const POLL_END_TIME_OPTIONS = [
  { label: '1小时后', hours: 1 },
  { label: '3小时后', hours: 3 },
  { label: '6小时后', hours: 6 },
  { label: '12小时后', hours: 12 },
  { label: '1天后', hours: 24 },
  { label: '2天后', hours: 48 },
  { label: '3天后', hours: 72 },
  { label: '1周后', hours: 168 },
];

export const POLL_FILTER_OPTIONS = [
  { key: 'all' as const, label: '全部', emoji: '📋' },
  { key: 'active' as const, label: '进行中', emoji: '🗳️' },
  { key: 'ended' as const, label: '已结束', emoji: '✅' },
  { key: 'archived' as const, label: '已归档', emoji: '📦' },
];

export const POLL_EMPTY_MESSAGES = {
  all: [
    { emoji: '🗳️', text: '还没有投票，快来发起第一个吧~' },
    { emoji: '🤔', text: '大家还没开始讨论事务呢' },
  ],
  active: [
    { emoji: '🎉', text: '太棒了！没有进行中的投票' },
    { emoji: '💤', text: '当前没有需要大家决策的事情' },
  ],
  ended: [
    { emoji: '📭', text: '还没有已结束的投票' },
    { emoji: '⏳', text: '耐心等待投票结束吧~' },
  ],
  archived: [
    { emoji: '📦', text: '归档区空空如也' },
    { emoji: '🪶', text: '还没有已归档的投票' },
  ],
};

export const POLL_PRESET_TOPICS = [
  { title: '要不要养猫？', emoji: '🐱', options: ['同意养猫', '不同意', '先养只试试'] },
  { title: '夏天空调开多少度？', emoji: '🌡️', options: ['24度', '25度', '26度', '27度'] },
  { title: '周末一起聚餐吗？', emoji: '🍕', options: ['好呀！', '没空', '看情况'] },
  { title: '公共区域多久打扫一次？', emoji: '🧹', options: ['每天', '每周2次', '每周1次', '脏了再扫'] },
  { title: '要不要装路由器？', emoji: '📶', options: ['同意', '不同意', '用各自的就行'] },
];
