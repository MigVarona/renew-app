import { useEffect, useState } from 'react';

import { readStepsForToday, toggleAllStepsToday, toggleStepToday } from '@/lib/progress';

export function useProtocolProgress(slug: string) {
  const [done, setDone] = useState<number[]>(() => readStepsForToday(slug));

  useEffect(() => {
    setDone(readStepsForToday(slug));
  }, [slug]);

  function toggle(index: number) {
    setDone(toggleStepToday(slug, index));
  }

  function toggleAll(totalSteps: number) {
    setDone(toggleAllStepsToday(slug, totalSteps));
  }

  return { done, toggle, toggleAll };
}
