export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function daysRemaining(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function isOverdue(dateStr: string): boolean {
  return daysRemaining(dateStr) < 0;
}

export function isToday(dateStr: string): boolean {
  return daysRemaining(dateStr) === 0;
}

export function getDueLabel(dateStr: string): { text: string; type: 'normal' | 'soon' | 'today' | 'overdue' } {
  const days = daysRemaining(dateStr);
  if (days < 0) {
    return { text: `已逾期${Math.abs(days)}天`, type: 'overdue' };
  }
  if (days === 0) {
    return { text: '今天到期', type: 'today' };
  }
  if (days === 1) {
    return { text: '明天到期', type: 'soon' };
  }
  if (days <= 3) {
    return { text: `还有${days}天`, type: 'soon' };
  }
  return { text: `还有${days}天`, type: 'normal' };
}

export function formatCommentTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return '刚刚';
  }
  if (diffMin < 60) {
    return `${diffMin}分钟前`;
  }
  if (diffHour < 24) {
    return `${diffHour}小时前`;
  }
  if (diffDay === 1) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  if (diffDay < 7) {
    return `${diffDay}天前`;
  }
  return formatDateShort(dateStr);
}
