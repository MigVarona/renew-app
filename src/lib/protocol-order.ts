import type { Protocol } from '@/lib/articles';

type Daypart = 'morning' | 'evening' | 'any';

const DAYPART_BY_SLUG: Record<string, Daypart> = {
  'morning-sunlight-circadian-rhythm': 'morning',
  'minimalist-morning-routine-habits': 'morning',
  'sleep-architecture-performance': 'evening',
  'digital-detox-attention-wellness': 'evening',
};

function currentDaypart(hour: number): Daypart {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 19) return 'evening';
  return 'any';
}

function score(protocol: Protocol, now: Daypart): number {
  const part = DAYPART_BY_SLUG[protocol.slug] ?? 'any';

  if (part === now) return 0;
  if (part === 'any') return 1;
  return 2;
}

export function orderProtocolsForNow(protocols: Protocol[], date = new Date()): Protocol[] {
  const now = currentDaypart(date.getHours());
  return [...protocols].sort((a, b) => score(a, now) - score(b, now));
}
