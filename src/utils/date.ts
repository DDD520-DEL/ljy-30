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

export function formatCountdown(targetDateStr: string): { text: string; isUrgent: boolean; isEnded: boolean } {
  const target = new Date(targetDateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { text: '已结束', isUrgent: false, isEnded: true };
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const isUrgent = diffHour < 1;

  if (diffDay >= 1) {
    const hours = diffHour % 24;
    return hours > 0
      ? { text: `${diffDay}天${hours}小时`, isUrgent, isEnded: false }
      : { text: `${diffDay}天`, isUrgent, isEnded: false };
  }
  if (diffHour >= 1) {
    const mins = diffMin % 60;
    return mins > 0
      ? { text: `${diffHour}小时${mins}分`, isUrgent, isEnded: false }
      : { text: `${diffHour}小时`, isUrgent, isEnded: false };
  }
  if (diffMin >= 1) {
    return { text: `${diffMin}分钟`, isUrgent, isEnded: false };
  }
  return { text: `${diffSec}秒`, isUrgent: true, isEnded: false };
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

export function isBirthdayToday(birthdayStr: string): boolean {
  if (!birthdayStr) return false;
  const birthday = new Date(birthdayStr);
  const today = new Date();
  return (
    birthday.getMonth() === today.getMonth() &&
    birthday.getDate() === today.getDate()
  );
}

export function isMoveInAnniversaryToday(moveInDateStr: string): boolean {
  if (!moveInDateStr) return false;
  const moveInDate = new Date(moveInDateStr);
  const today = new Date();
  return (
    moveInDate.getMonth() === today.getMonth() &&
    moveInDate.getDate() === today.getDate()
  );
}

export function getDaysUntilBirthday(birthdayStr: string): number {
  if (!birthdayStr) return -1;
  const birthday = new Date(birthdayStr);
  const today = new Date();
  birthday.setFullYear(today.getFullYear());
  birthday.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (birthday < today) {
    birthday.setFullYear(today.getFullYear() + 1);
  }
  const diffTime = birthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getDaysUntilMoveInAnniversary(moveInDateStr: string): number {
  if (!moveInDateStr) return -1;
  const moveInDate = new Date(moveInDateStr);
  const today = new Date();
  moveInDate.setFullYear(today.getFullYear());
  moveInDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (moveInDate < today) {
    moveInDate.setFullYear(today.getFullYear() + 1);
  }
  const diffTime = moveInDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getAge(birthdayStr: string): number {
  if (!birthdayStr) return 0;
  const birthday = new Date(birthdayStr);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  return age;
}

export function getYearsSinceMoveIn(moveInDateStr: string): number {
  if (!moveInDateStr) return 0;
  const moveInDate = new Date(moveInDateStr);
  const today = new Date();
  let years = today.getFullYear() - moveInDate.getFullYear();
  const monthDiff = today.getMonth() - moveInDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < moveInDate.getDate())) {
    years--;
  }
  return years;
}

export function getMonthBirthdays(roommates: { id: string; name: string; avatar: string; color: string; birthday?: string }[]): typeof roommates {
  const today = new Date();
  const currentMonth = today.getMonth();
  return roommates
    .filter((r) => {
      if (!r.birthday) return false;
      const birthday = new Date(r.birthday);
      return birthday.getMonth() === currentMonth;
    })
    .sort((a, b) => {
      const dayA = new Date(a.birthday!).getDate();
      const dayB = new Date(b.birthday!).getDate();
      return dayA - dayB;
    });
}

export function getMonthMoveInAnniversaries(roommates: { id: string; name: string; avatar: string; color: string; moveInDate?: string }[]): typeof roommates {
  const today = new Date();
  const currentMonth = today.getMonth();
  return roommates
    .filter((r) => {
      if (!r.moveInDate) return false;
      const moveInDate = new Date(r.moveInDate);
      return moveInDate.getMonth() === currentMonth;
    })
    .sort((a, b) => {
      const dayA = new Date(a.moveInDate!).getDate();
      const dayB = new Date(b.moveInDate!).getDate();
      return dayA - dayB;
    });
}
