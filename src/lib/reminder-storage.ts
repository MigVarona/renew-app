import Storage from 'expo-sqlite/kv-store';

const KEY = 'protocol-reminders';

export type ReminderConfig = {
  identifier: string;
  hour: number;
  minute: number;
};

type Reminders = Record<string, ReminderConfig>;

function read(): Reminders {
  const raw = Storage.getItemSync(KEY);

  if (!raw) return {};

  try {
    return JSON.parse(raw) as Reminders;
  } catch {
    Storage.removeItemSync(KEY);
    return {};
  }
}

export function readReminder(slug: string): ReminderConfig | null {
  return read()[slug] ?? null;
}

export function saveReminder(slug: string, config: ReminderConfig): void {
  const reminders = read();
  reminders[slug] = config;
  Storage.setItemSync(KEY, JSON.stringify(reminders));
}

export function clearReminder(slug: string): void {
  const reminders = read();
  delete reminders[slug];
  Storage.setItemSync(KEY, JSON.stringify(reminders));
}
