import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchArticle, fetchArticles, type FullArticle } from '@/lib/articles';
import { readCache, writeCache } from '@/lib/storage';

type Result<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isOffline: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
};

function useCachedResource<T>(cacheKey: string, fetcher: () => Promise<T>): Result<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const hasDataRef = useRef(false);
  hasDataRef.current = data !== null;

  const refresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const fresh = await fetcherRef.current();
      setData(fresh);
      setError(null);
      setIsOffline(false);
      await writeCache(cacheKey, fresh);
    } catch (cause) {
      if (hasDataRef.current) {
        setIsOffline(true);
      } else {
        setError((cause as Error).message);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cached = await readCache<T>(cacheKey);

      if (cancelled) return;

      if (cached) {
        setData(cached);
        setIsLoading(false);
      }

      try {
        const fresh = await fetcherRef.current();
        if (cancelled) return;

        setData(fresh);
        setError(null);
        setIsOffline(false);
        await writeCache(cacheKey, fresh);
      } catch (cause) {
        if (cancelled) return;

        if (cached) {
          setIsOffline(true);
        } else {
          setError((cause as Error).message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  return { data, error, isLoading, isOffline, isRefreshing, refresh };
}

export function useArticles(): Result<FullArticle[]> {
  return useCachedResource('articles', fetchArticles);
}

export function useArticle(slug: string): Result<FullArticle> {
  return useCachedResource(`article:${slug}`, () => fetchArticle(slug));
}
