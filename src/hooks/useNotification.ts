import { useEffect, useRef } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { getDueLabel } from '@/utils/date';

const NOTIFICATION_SENT_KEY = 'borrow-tracker-notification-sent';

interface UseNotificationOptions {
  onNotificationClick?: (recordId: string) => void;
}

export function useNotification({ onNotificationClick }: UseNotificationOptions = {}) {
  const { getDueReminders, checkOverdue } = useBorrowStore();
  const notifiedRef = useRef<Set<string>>(new Set());
  const clickHandlerRef = useRef(onNotificationClick);
  clickHandlerRef.current = onNotificationClick;

  useEffect(() => {
    checkOverdue();

    const requestPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };

    requestPermission();

    const sendNotification = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      if (document.visibilityState === 'visible') return;

      const reminders = getDueReminders();
      const todayKey = new Date().toISOString().slice(0, 10);
      const storageKey = `${NOTIFICATION_SENT_KEY}-${todayKey}`;

      try {
        const sentToday = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'));
        const newReminders = reminders.filter((r) => !sentToday.has(r.id) && !notifiedRef.current.has(r.id));

        if (newReminders.length === 0) return;

        const overdueItems = newReminders.filter((r) => getDueLabel(r.expectedReturnDate).type === 'overdue');
        const todayDueItems = newReminders.filter((r) => getDueLabel(r.expectedReturnDate).type === 'today');

        const lines: string[] = [];
        if (overdueItems.length > 0) lines.push(`🚨 ${overdueItems.length}个物品已逾期`);
        if (todayDueItems.length > 0) lines.push(`⏰ ${todayDueItems.length}个物品今日到期`);

        const title = '🏠 归还提醒';
        const body = lines.join('，') + '，点击查看详情';

        const options: NotificationOptions = {
          body,
          icon: '/vite.svg',
          tag: 'borrow-reminder',
        };

        const notification = new Notification(title, options);

        const firstRecordId = newReminders[0].id;

        notification.onclick = () => {
          window.focus();
          notification.close();
          clickHandlerRef.current?.(firstRecordId);
        };

        newReminders.forEach((r) => {
          notifiedRef.current.add(r.id);
          sentToday.add(r.id);
        });
        localStorage.setItem(storageKey, JSON.stringify([...sentToday]));
      } catch {
        // ignore storage errors
      }
    };

    sendNotification();

    const interval = setInterval(() => {
      checkOverdue();
      sendNotification();
    }, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') return;
      checkOverdue();
      setTimeout(sendNotification, 1000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkOverdue, getDueReminders]);
}
