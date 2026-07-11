import Storage from 'expo-sqlite/kv-store';

export async function readCache<T>(key: string): Promise<T | null> {
  const raw = await Storage.getItem(key);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    await Storage.removeItem(key);
    return null;
  }
}

export async function writeCache(key: string, value: unknown): Promise<void> {
  await Storage.setItem(key, JSON.stringify(value));
}
