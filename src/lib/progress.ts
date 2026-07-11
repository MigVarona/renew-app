import Storage from 'expo-sqlite/kv-store';

const KEY = 'protocol-progress';

type Progress = Record<string, Record<string, number[]>>;

export function todayKey(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function read(): Progress {
  const raw = Storage.getItemSync(KEY);

  if (!raw) return {};

  try {
    return JSON.parse(raw) as Progress;
  } catch {
    Storage.removeItemSync(KEY);
    return {};
  }
}

export function readStepsForToday(slug: string): number[] {
  return read()[slug]?.[todayKey()] ?? [];
}

export function toggleStepToday(slug: string, index: number): number[] {
  const progress = read();
  const today = todayKey();
  const current = progress[slug]?.[today] ?? [];

  const next = current.includes(index)
    ? current.filter((step) => step !== index)
    : [...current, index].sort((a, b) => a - b);

  progress[slug] = { ...progress[slug], [today]: next };
  Storage.setItemSync(KEY, JSON.stringify(progress));

  return next;
}

// Racha: días consecutivos con actividad (algún paso marcado en alguna práctica).
// Si hoy aún no hay actividad, la racha viva de ayer se conserva — no castiga a quien
// abre la app por la mañana antes de practicar.
export function currentStreak(): number {
  const progress = read();
  const activeDays = new Set<string>();

  for (const byDay of Object.values(progress)) {
    for (const [day, steps] of Object.entries(byDay)) {
      if (steps.length > 0) activeDays.add(day);
    }
  }

  const cursor = new Date();
  let streak = 0;

  if (!activeDays.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (activeDays.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function toggleAllStepsToday(slug: string, totalSteps: number): number[] {
  const progress = read();
  const today = todayKey();
  const current = progress[slug]?.[today] ?? [];

  const next = current.length === totalSteps ? [] : Array.from({ length: totalSteps }, (_, i) => i);

  progress[slug] = { ...progress[slug], [today]: next };
  Storage.setItemSync(KEY, JSON.stringify(progress));

  return next;
}
