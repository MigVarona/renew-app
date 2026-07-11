import { useState } from 'react';

import { clearReminder, readReminder, saveReminder } from '@/lib/reminder-storage';
import { cancelReminder, requestReminderPermission, scheduleDailyReminder } from '@/lib/reminders';

export function useReminder(slug: string, notificationTitle: string, notificationBody: string) {
  const [reminder, setReminder] = useState(() => readReminder(slug));
  const [isSaving, setIsSaving] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  async function setTime(hour: number, minute: number) {
    setIsSaving(true);
    setPermissionDenied(false);

    try {
      const granted = await requestReminderPermission();

      if (!granted) {
        setPermissionDenied(true);
        return;
      }

      if (reminder) {
        await cancelReminder(reminder.identifier);
      }

      const identifier = await scheduleDailyReminder({
        hour,
        minute,
        title: notificationTitle,
        body: notificationBody,
      });

      const next = { identifier, hour, minute };
      saveReminder(slug, next);
      setReminder(next);
    } finally {
      setIsSaving(false);
    }
  }

  async function clear() {
    if (!reminder) return;

    setIsSaving(true);
    try {
      await cancelReminder(reminder.identifier);
      clearReminder(slug);
      setReminder(null);
    } finally {
      setIsSaving(false);
    }
  }

  return { reminder, isSaving, permissionDenied, setTime, clear };
}
